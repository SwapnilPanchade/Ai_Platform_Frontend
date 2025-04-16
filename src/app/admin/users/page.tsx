"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import logger from "@/utils/logger";

interface UserData {
  _id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) {
      console.log("Auth context is loading...");
      return;
    }

    if (!token) {
      console.log("No auth token found, redirecting from users page...");
      router.push("/admin/login");
      return;
    }

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL ||
          "http://localhost:5001/api";
        const response = await fetch(`${apiUrl}/admin/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Unauthorized or Forbidden accessing users.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserData[] = await response.json();
        console.log("fetched user data : ", data);
        setUsers(data);
      } catch (err: unknown) {
        console.error("Failed to fetch admin users:", err);
        let errorMessage = "An error occurred while fetching users.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        //! Let it be for now
        //  if (err instanceof Error && err.message.includes('Unauthorized')) {
        //    logout();
        //      router.push('/admin/login');
        //  }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }

  if (!token) {
    return <div className="text-center p-6">Redirecting to login...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Manage Users</h1>
      {/* ... (loading/error checks) ... */}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {/* Check that headers match the columns below */}
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Joined
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                // Add console log inside map for debugging individual user object
                // console.log("Rendering user:", user),
                <tr key={user._id}>
                  {/* --- CHECK THESE CELLS CAREFULLY --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {/* Access firstName and lastName, provide fallback */}
                    {user.firstName || ""} {user.lastName || ""}
                    {/* If name is blank, maybe show email as fallback? */}
                    {!user.firstName && !user.lastName
                      ? "(No name provided)"
                      : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email} {/* Display email */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role} {/* Display role */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Display formatted date */}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {/* --- End Check --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
