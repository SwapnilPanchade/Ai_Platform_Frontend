"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface UserEditData {
  _id: string;
  email: string;
  role: "free" | "pro" | "admin";
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
}

interface UserUpdatePayload {
  role?: "free" | "pro" | "admin";
  firstName?: string;
  lastName?: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [userData, setUserData] = useState<UserEditData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const userIdParam = params?.userId;
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

  useEffect(() => {
    if (isAuthLoading || !token || !userId) {
      setIsLoading(isAuthLoading);
      if (!isAuthLoading && !token) setError("Not authenticated.");
      if (!isAuthLoading && !userId) setError("User ID not found in URL.");
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL ||
          "http://localhost:5001/api";
        const response = await fetch(`${apiUrl}/admin/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("User not found.");
          if (response.status === 401 || response.status === 403)
            throw new Error("Unauthorized to fetch user details.");
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserEditData = await response.json();
        setUserData(data);
      } catch (err: unknown) {
        console.error("Failed to fetch user data:", err);
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token, isAuthLoading]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (userData) {
      setUserData({
        ...userData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userData || !token || !userId) {
      setError("Cannot save. User data or authentication missing.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload: UserUpdatePayload = {
      role: userData.role,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
    };

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403)
          throw new Error("Unauthorized to update user.");
        if (response.status === 404)
          throw new Error("User not found for update.");
        throw new Error(
          responseData.message ||
            `Update failed with status: ${response.status}`
        );
      }

      setUserData(responseData);
      setSuccessMessage("User details updated successfully!");
    } catch (err: unknown) {
      console.error("Failed to update user:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during update."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading user data...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }

  if (!userData) {
    return <div className="text-center p-6">User data not available.</div>;
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back to Users
      </button>
      <h1 className="text-2xl font-semibold mb-4">
        Edit User: {userData.email}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 bg-white shadow-md rounded-lg"
      >
        {/* Display non-editable info */}
        <div className="mb-2">
          <span className="font-medium text-gray-700">User ID:</span>
          <span className="ml-2 text-gray-600 text-sm">{userData._id}</span>
        </div>
        <div className="mb-2">
          <span className="font-medium text-gray-700">Email:</span>
          <span className="ml-2 text-gray-600">{userData.email}</span>
        </div>

        {/* Editable Fields */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={userData.firstName || ""}
            onChange={handleInputChange}
            disabled={isSaving}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={userData.lastName || ""}
            onChange={handleInputChange}
            disabled={isSaving}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={userData.role}
            onChange={handleInputChange}
            disabled={isSaving}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Display Read-only Stripe Info (if available) */}
        {userData.stripeCustomerId && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Subscription Info
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Stripe Customer ID:</span>{" "}
              {userData.stripeCustomerId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Subscription ID:</span>{" "}
              {userData.stripeSubscriptionId || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span>{" "}
              {userData.stripeSubscriptionStatus || "N/A"}
            </p>
          </div>
        )}

        {/* Display Timestamps */}
        <div className="mt-4 text-xs text-gray-500">
          <p>Created: {new Date(userData.createdAt).toLocaleString()}</p>
          <p>Last Updated: {new Date(userData.updatedAt).toLocaleString()}</p>
        </div>

        {/* Submit Button & Messages */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}
          {error && <p className="text-sm text-red-600">Error: {error}</p>}
        </div>
      </form>
    </div>
  );
}
