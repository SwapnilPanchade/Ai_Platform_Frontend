"use client";

import React, { useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface AdminRouteGuardProps {
  children: ReactNode;
}

const AdminRouteGuard = ({
  children,
}: AdminRouteGuardProps): React.ReactElement | null => {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    if (!isLoading) {
      if (!token && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    }
  }, [token, isLoading, router, pathname]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (token || pathname === "/admin/login") {
    return <>{children}</>;
  }

  return null;
};

export default AdminRouteGuard;
