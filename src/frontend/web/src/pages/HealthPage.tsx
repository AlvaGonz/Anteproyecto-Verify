import { useEffect, useState } from "react";
import { getApiStatus, getHealthCheck } from "../infrastructure/api/httpClient";
import { ApiStatus, HealthCheckResponse } from "../shared/types/health";

export function HealthPage() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statusData, healthData] = await Promise.all([
          getApiStatus(),
          getHealthCheck(),
        ]);
        setStatus(statusData);
        setHealth(healthData);
      } catch (err) {
        setError("Failed to connect to backend API.");
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
          <h1 className="text-2xl font-bold">
            Corporativo Web App - System Status
          </h1>
          <p className="text-gray-500 mt-2">
            Frontend is running successfully.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg shadow border-l-4 border-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">
              API Status (/api/status)
            </h2>
            {status ? (
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium">Service:</span>{" "}
                  {status.serviceName}
                </li>
                <li>
                  <span className="font-medium">Environment:</span>{" "}
                  {status.environment}
                </li>
                <li>
                  <span className="font-medium">Version:</span> {status.version}
                </li>
                <li>
                  <span className="font-medium">DB Configured:</span>{" "}
                  {status.databaseConfigured ? "✅ Yes" : "❌ No"}
                </li>
                <li>
                  <span className="font-medium">Blob Configured:</span>{" "}
                  {status.blobStorageConfigured ? "✅ Yes" : "❌ No"}
                </li>
                <li>
                  <span className="font-medium">Time:</span>{" "}
                  {new Date(status.timestamp).toLocaleString()}
                </li>
              </ul>
            ) : (
              !error && <p className="text-gray-400">Loading...</p>
            )}
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">
              Health Checks (/health)
            </h2>
            {health ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Overall Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${health.status === "Healthy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {health.status}
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  {health.checks.map((check) => (
                    <li
                      key={check.name}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <span>{check.name}</span>
                      <span
                        className={
                          check.status === "Healthy"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {check.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              !error && <p className="text-gray-400">Loading...</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
