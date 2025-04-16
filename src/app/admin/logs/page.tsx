"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface LogEntry {
  _id: string;
  timestamp: string;
  level: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  message: string;
  userId?: string;
  ipAddress?: string;
  method?: string;
  url?: string;
  status?: number;
  responseTime?: number;
  errorStack?: string;
  meta?: Record<string, unknown>;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalLogs: number;
  limit: number;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isLoading: isAuthLoading } = useAuth();
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const fetchLogs = useCallback(
    async (page: number, fetchLimit: number) => {
      if (isAuthLoading || !token) {
        setIsLoading(isAuthLoading);
        if (!isAuthLoading && !token) setError("Not authenticated.");
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log(`Fetching logs for page ${page}, limit ${fetchLimit}`);

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL ||
          "http://localhost:5001/api";
        // Construct query parameters
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: fetchLimit.toString(),
          sort: "-timestamp", // Default sort: newest first
          // Add other filters here later (e.g., level, userId)
        });

        const response = await fetch(
          `${apiUrl}/admin/logs?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403)
            throw new Error("Unauthorized to fetch logs.");
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Logs API Response:", data);

        if (data && data.data && data.pagination) {
          setLogs(data.data);
          setPagination(data.pagination);
          setLimit(data.pagination.limit);
        } else {
          throw new Error("Invalid API response structure for logs.");
        }
      } catch (err: unknown) {
        console.error("Failed to fetch admin logs:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred fetching logs."
        );
        setLogs([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    },
    [token, isAuthLoading]
  );

  useEffect(() => {
    if (!isAuthLoading) {
      fetchLogs(currentPage, limit);
    }
  }, [currentPage, limit, fetchLogs, isAuthLoading]);

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">System Logs</h1>

      {/* TODO: Add filtering controls here (dropdown for level, input for userId) */}

      {isAuthLoading ? (
        <div className="text-center p-6">Authenticating...</div>
      ) : isLoading ? (
        <div className="text-center p-6">Loading logs...</div>
      ) : error ? (
        <div className="text-center p-6 text-red-600">Error: {error}</div>
      ) : logs.length === 0 ? (
        <p className="p-6 text-center">No log entries found.</p>
      ) : (
        <>
          {/* Log Table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Req Info
                  </th>
                  {/* Add more columns if needed (IP, Meta, etc.) */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Add color coding for levels */}
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.level === "error" || log.level === "fatal"
                            ? "bg-red-100 text-red-800"
                            : log.level === "warn"
                            ? "bg-yellow-100 text-yellow-800"
                            : log.level === "info"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800" // debug/trace
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 break-words">
                      {log.message}
                      {log.errorStack && (
                        <pre className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded overflow-x-auto">
                          <code>{log.errorStack}</code>
                        </pre>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.userId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.method && `${log.method} `}{" "}
                      {log.url && `${log.url} `}{" "}
                      {log.status && `(${log.status})`}
                      {log.ipAddress && ` [${log.ipAddress}]`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} (Total:{" "}
                {pagination.totalLogs})
              </span>
              <div className="space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1 || isLoading}
                  className="px-3 py-1 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= pagination.totalPages || isLoading}
                  className="px-3 py-1 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
