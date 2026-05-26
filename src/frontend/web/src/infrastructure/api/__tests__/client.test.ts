import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import apiClient, { setAccessToken, getAccessToken } from "../client";

describe("apiClient", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    setAccessToken(null);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it("attaches Bearer token on request when accessToken is set", async () => {
    setAccessToken("test-token");
    mock.onGet("/test-endpoint").reply((config) => {
      expect(config.headers?.Authorization).toBe("Bearer test-token");
      return [200, { success: true }];
    });

    const response = await apiClient.get("/test-endpoint");

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });
  });

  it("retries request with new token on 401 response and updates token", async () => {
    let mainEndpointCalledTimes = 0;

    mock.onGet("/retry-endpoint").reply(() => {
      mainEndpointCalledTimes++;
      if (mainEndpointCalledTimes === 1) {
        return [401, { message: "Unauthorized" }];
      }
      return [200, { data: "success-retry" }];
    });

    const axiosPostMock = vi.spyOn(axios, "post").mockResolvedValue({
      data: { accessToken: "new-token", expiresIn: 3600 },
    });

    const response = await apiClient.get("/retry-endpoint");

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: "success-retry" });
    expect(mainEndpointCalledTimes).toBe(2);
    expect(getAccessToken()).toBe("new-token");
    expect(axiosPostMock).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
  });

  it("dispatches auth:logout custom event and nullifies token when refresh fails on 401", async () => {
    setAccessToken("old-expired-token");
    mock.onGet("/fail-endpoint").reply(401);

    const axiosPostMock = vi.spyOn(axios, "post").mockRejectedValue({
      response: { status: 401 },
    });

    const logoutSpy = vi.fn();
    window.addEventListener("auth:logout", logoutSpy);

    await expect(apiClient.get("/fail-endpoint")).rejects.toThrow();

    expect(logoutSpy).toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
    expect(axiosPostMock).toHaveBeenCalled();

    window.removeEventListener("auth:logout", logoutSpy);
  });
});
