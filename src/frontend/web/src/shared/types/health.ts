export interface ApiStatus {
  serviceName: string;
  environment: string;
  version: string;
  timestamp: string;
  databaseConfigured: boolean;
  blobStorageConfigured: boolean;
}

export interface HealthCheckItem {
  name: string;
  status: string;
  description?: string;
}

export interface HealthCheckResponse {
  status: string;
  checks: HealthCheckItem[];
  duration: string;
}
