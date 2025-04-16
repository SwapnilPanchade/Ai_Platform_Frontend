import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminRouteGuard from "./AdminRouteGuard";
import Link from "next/link";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminRouteGuard>
        <section className="flex h-screen bg-gray-100">
          <aside className="w-64 bg-gray-800 text-white p-4 hidden md:block">
            <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>

            <nav>
              <ul>
                <li className="mb-2">
                  <Link href="/admin/users" className="hover:text-blue-300">
                    Users
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/admin/logs" className="hover:text-blue-300">
                    Logs
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/websocket-test" className="hover:text-blue-300">
                    WebSockets
                  </Link>
                </li>
                {/*space for  a logout button */}
              </ul>
            </nav>
          </aside>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </section>
      </AdminRouteGuard>
    </AuthProvider>
  );
}
