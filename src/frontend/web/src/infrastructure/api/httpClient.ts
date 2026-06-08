import { env } from "../config/env";
import { ApiStatus, HealthCheckResponse } from "../../shared/types/health";

const API_BASE_URL = env.API_URL;

export async function getApiStatus(): Promise<ApiStatus> {
  const response = await fetch(`${API_BASE_URL}/api/status`);
  if (!response.ok) throw new Error("Failed to fetch API status");
  return response.json();
}

export async function getHealthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("Failed to fetch health check");
  return response.json();
}
