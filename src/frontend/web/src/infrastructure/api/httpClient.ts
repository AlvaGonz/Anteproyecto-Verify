import { env } from "../config/env";
import { ApiStatus, HealthCheckResponse } from "../../shared/types/health";

const API_BASE_URL = env.API_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export async function getApiStatus(): Promise<ApiStatus> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          serviceName: "VeriFinca Mock API",
          environment: "Development",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          databaseConfigured: true,
          blobStorageConfigured: true
        });
      }, 300);
    });
  }
  const response = await fetch(`${API_BASE_URL}/api/status`);
  if (!response.ok) throw new Error("Failed to fetch API status");
  return response.json();
}

export async function getHealthCheck(): Promise<HealthCheckResponse> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: "Healthy",
          duration: "00:00:00.0500000",
          checks: [
            {
              name: "sqlserver",
              description: "SQL Server Connection",
              status: "Healthy"
            },
            {
              name: "blobstorage",
              description: "Azure Blob Storage Connection",
              status: "Healthy"
            }
          ]
        });
      }, 300);
    });
  }
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("Failed to fetch health check");
  return response.json();
}
