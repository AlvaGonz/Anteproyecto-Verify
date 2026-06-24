import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { apiClient, setAccessToken, getAccessToken } from '../infrastructure/api/client';

describe('apiClient interceptor', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    // We mock the underlying axios instance
    mock = new MockAdapter(axios);
    
    // Also clear tokens
    setAccessToken(null);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it('retries original request on 401 using silent refresh', async () => {
    // 1. Setup the mock for the original request returning 401
    // Wait, the apiClient is its own instance, but we need to mock it.
    // Actually, apiClient uses axios.post for refresh, so we need to mock both.
    const clientMock = new MockAdapter(apiClient);
    
    clientMock.onGet('/protected-data').replyOnce(401, { message: 'Unauthorized' });
    
    // 2. The retry of the original request should succeed
    clientMock.onGet('/protected-data').replyOnce(200, { data: 'Success' });

    // 3. Setup the mock for the global axios used in refresh
    mock.onPost(/\/auth\/refresh/).replyOnce(200, {
      accessToken: 'new-mocked-token',
      expiresIn: 7200
    });

    // We also need to spy on window.dispatchEvent to ensure auth:force-logout is not called
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    // 4. Fire the original request
    const response = await apiClient.get('/protected-data');

    // 5. Assertions
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ data: 'Success' });
    expect(getAccessToken()).toBe('new-mocked-token');
    
    // Check that Authorization header was updated
    expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer new-mocked-token');
    
    expect(dispatchSpy).not.toHaveBeenCalledWith(new Event('auth:force-logout'));
    
    clientMock.restore();
  });

  it('dispatches auth:force-logout if refresh fails', async () => {
    const clientMock = new MockAdapter(apiClient);
    clientMock.onGet('/protected-data').replyOnce(401, { message: 'Unauthorized' });

    mock.onPost(/\/auth\/refresh/).replyOnce(401, { message: 'Refresh failed' });

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    await expect(apiClient.get('/protected-data')).rejects.toThrow('Request failed with status code 401');

    expect(dispatchSpy).toHaveBeenCalled();
    const eventArg = dispatchSpy.mock.calls[0][0] as Event;
    expect(eventArg.type).toBe('auth:force-logout');

    clientMock.restore();
  });
});
