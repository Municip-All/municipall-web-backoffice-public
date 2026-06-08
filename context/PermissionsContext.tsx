"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  hasAnyPermission,
  hasPermission,
  isMayor,
  Permission,
  type PermissionCode,
} from "@/lib/permissions";

interface PermissionsContextValue {
  permissions: string[];
  can: (code: PermissionCode) => boolean;
  canAny: (codes: PermissionCode[]) => boolean;
  isMayor: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(
  undefined,
);

export function PermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const value = useMemo(() => {
    const permissions = user?.permissions ?? [];
    return {
      permissions,
      can: (code: PermissionCode) => hasPermission(permissions, code),
      canAny: (codes: PermissionCode[]) => hasAnyPermission(permissions, codes),
      isMayor: isMayor(user?.role),
    };
  }, [user]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return ctx;
}

export { Permission };
