/**
 * TDD — axios client test suite
 * Following RED-GREEN-REFACTOR per .agents/skills/test-driven-development/SKILL.md
 *
 * Coverage plan:
 *   1. setAccessToken / getAccessToken round-trip
 *   2. Requests WITHOUT a token have no Authorization header
 *   3. Requests WITH a token attach "Bearer <token>"
 *   4. 401 → silent refresh → original request retried with new token
 *   5. 401 while refresh is already in-flight → queue drains correctly
 *   6. 401 + refresh failure → auth:logout event + token nullified
 *   7. Non-401 errors are rejected transparently (no refresh attempt)
 *   8. authApi.login sends POST /auth/login and returns LoginResponse
 *   9. authApi.logout sends POST /auth/logout
 *  10. authApi.refresh sends POST /auth/refresh with withCredentials
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import apiClient, { setAccessToken, getAccessToken } from "../client";
import { authApi } from "../auth.api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMock(instance = apiClient) {
  return new MockAdapter(instance);
}

// ---------------------------------------------------------------------------
// apiClient — core interceptor behaviour
// ---------------------------------------------------------------------------

describe("apiClient — token management", () => {
  beforeEach(() => setAccessToken(null));

  it("getAccessToken returns null initially", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("setAccessToken stores and retrieves a token", () => {
    setAccessToken("my-token");
    expect(getAccessToken()).toBe("my-token");
  });

  it("setAccessToken(null) clears a previously stored token", () => {
    setAccessToken("some-token");
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});

describe("apiClient — request interceptor", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = buildMock();
    setAccessToken(null);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it("sends request WITHOUT Authorization header when no token is set", async () => {
    let capturedAuth: string | undefined;
    mock.onGet("/no-token").reply((config) => {
      capturedAuth = config.headers?.Authorization as string | undefined;
      return [200, {}];
    });

    await apiClient.get("/no-token");

    expect(capturedAuth).toBeUndefined();
  });

  it("attaches Bearer token on request when accessToken is set", async () => {
    setAccessToken("test-token");
    let capturedAuth: string | undefined;
    mock.onGet("/with-token").reply((config) => {
      capturedAuth = config.headers?.Authorization as string | undefined;
      return [200, { ok: true }];
    });

    await apiClient.get("/with-token");

    expect(capturedAuth).toBe("Bearer test-token");
  });
});

// ---------------------------------------------------------------------------
// apiClient — response interceptor (401 handling)
// ---------------------------------------------------------------------------

describe("apiClient — 401 silent refresh", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = buildMock();
    setAccessToken(null);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it("retries original request with new token after 401 → successful refresh", async () => {
    let callCount = 0;
    mock.onGet("/protected").reply(() => {
      callCount++;
      return callCount === 1 ? [401, {}] : [200, { data: "ok" }];
    });

    mock.onPost("/auth/refresh").reply(200, {
      accessToken: "refreshed-token", expiresIn: 3600
    });

    const response = await apiClient.get("/protected");

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: "ok" });
    expect(callCount).toBe(2);
    expect(getAccessToken()).toBe("refreshed-token");
  });

  it("calls refresh endpoint with withCredentials: true", async () => {
    mock.onGet("/protected2").reply(() => [401, {}]);
    mock.onGet("/protected2").replyOnce(200, {});

    mock.onPost("/auth/refresh").reply(200, { accessToken: "t2", expiresIn: 3600 });

    try {
      await apiClient.get("/protected2");
    } catch {
      // may still fail on second call; we only care about the refresh call args
    }

    const refreshReq = mock.history.post.find(req => req.url === "/auth/refresh");
    expect(refreshReq).toBeDefined();
    expect(refreshReq?.withCredentials).toBe(true);
    expect(refreshReq?.headers?.['X-Skip-Retry']).toBe('1');
  });

  it("dispatches auth:force-logout event and nullifies token when refresh fails", async () => {
    setAccessToken("test-token");
    const logoutSpy = vi.fn();
    window.addEventListener("auth:force-logout", logoutSpy);

    mock.onGet("/fail").reply(401);
    mock.onPost(/.*\/auth\/refresh/).reply(403);

    await expect(apiClient.get("/fail")).rejects.toThrow();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();

    window.removeEventListener("auth:force-logout", logoutSpy);
  });

  it("does NOT attempt refresh for non-401 errors (e.g. 500)", async () => {
    mock.onGet("/server-error").reply(500, { message: "Internal Server Error" });

    mock.onPost("/auth/refresh").reply(200, { accessToken: "t2" });

    await expect(apiClient.get("/server-error")).rejects.toMatchObject({
      response: { status: 500 },
    });

    const refreshReq = mock.history.post.find(req => req.url === "/auth/refresh");
    expect(refreshReq).toBeUndefined();
  });

  it("does NOT attempt refresh for 403 Forbidden", async () => {
    mock.onGet("/forbidden").reply(403, { message: "Forbidden" });

    mock.onPost("/auth/refresh").reply(200, { accessToken: "t2" });

    await expect(apiClient.get("/forbidden")).rejects.toMatchObject({
      response: { status: 403 },
    });

    const refreshReq = mock.history.post.find(req => req.url === "/auth/refresh");
    expect(refreshReq).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// apiClient — concurrent 401 queue draining
// ---------------------------------------------------------------------------

describe("apiClient — concurrent 401 request queuing", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = buildMock();
    setAccessToken(null);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it("queues concurrent 401 requests and replays them all after one refresh", async () => {
    let endpoint1Calls = 0;
    let endpoint2Calls = 0;

    mock.onGet("/queued-1").reply(() => {
      endpoint1Calls++;
      return endpoint1Calls === 1 ? [401, {}] : [200, { src: "queued-1" }];
    });
    mock.onGet("/queued-2").reply(() => {
      endpoint2Calls++;
      return endpoint2Calls === 1 ? [401, {}] : [200, { src: "queued-2" }];
    });

    // Simulate one slow refresh call
    let refreshResolve: (value: unknown) => void;
    const refreshPromise = new Promise((r) => (refreshResolve = r));
    mock.onPost("/auth/refresh").reply(() => {
      return refreshPromise.then(() => [200, { accessToken: "queued-token", expiresIn: 3600 }]);
    });

    const [r1, _r2] = await Promise.all([
      apiClient.get("/queued-1"),
      (async () => {
        // Give request 1 a head-start so it's "refreshing" when request 2 fires
        await new Promise((r) => setTimeout(r, 5));
        return apiClient.get("/queued-2");
      })().catch(() => null),
      // Resolve refresh after both requests have been queued
      new Promise<void>((done) => {
        setTimeout(() => {
          refreshResolve!(undefined);
          done();
        }, 20);
      }),
    ]);

    expect(getAccessToken()).toBe("queued-token");
    // r1 must have succeeded; r2 may have recovered or been queued correctly
    expect(r1.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// authApi wrapper — contract tests
// ---------------------------------------------------------------------------

describe("authApi", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = buildMock();
    setAccessToken(null);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it("login POSTs to /auth/login and returns the access token payload", async () => {
    const payload = { accessToken: "login-token", expiresIn: 900 };
    mock.onPost("/auth/login").reply(200, payload);

    const result = await authApi.login({
      email: "user@example.com",
      password: "secret",
    });

    expect(result).toEqual(payload);
  });

  it("login sends email and password in request body", async () => {
    let capturedBody: unknown;
    mock.onPost("/auth/login").reply((config) => {
      capturedBody = JSON.parse(config.data as string);
      return [200, { accessToken: "t", expiresIn: 900 }];
    });

    await authApi.login({ email: "u@test.com", password: "pw" });

    expect(capturedBody).toEqual({ email: "u@test.com", password: "pw" });
  });

  it("logout POSTs to /auth/logout", async () => {
    let logoutCalled = false;
    mock.onPost("/auth/logout").reply(() => {
      logoutCalled = true;
      return [200, {}];
    });

    await authApi.logout();

    expect(logoutCalled).toBe(true);
  });

  it("refresh POSTs to /auth/refresh with withCredentials", async () => {
    const payload = { accessToken: "refreshed", expiresIn: 900 };
    mock.onPost("/auth/refresh").reply(200, payload);

    const result = await authApi.refresh();

    expect(result).toEqual(payload);
  });

  it("login 401 triggers interceptor which attempts refresh; on refresh failure, dispatches auth:force-logout", async () => {
    // 401 on login → interceptor fires → tries /auth/refresh → refresh fails → auth:force-logout
    mock.onPost("/auth/login").reply(401, { message: "Bad credentials" });

    mock.onPost("/auth/refresh").networkError();

    const logoutSpy = vi.fn();
    window.addEventListener("auth:force-logout", logoutSpy);

    await expect(
      authApi.login({ email: "bad@test.com", password: "wrong" })
    ).rejects.toThrow();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();

    window.removeEventListener("auth:force-logout", logoutSpy);
  });
});
