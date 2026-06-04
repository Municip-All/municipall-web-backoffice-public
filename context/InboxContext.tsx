"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { api, CityDashboardStats, DashboardAlert } from "@/lib/api";

interface InboxContextValue {
  stats: CityDashboardStats | null;
  alerts: DashboardAlert[];
  pendingReports: number;
  pendingMessages: number;
  pendingTotal: number;
  urgentCount: number;
  isLoading: boolean;
  refresh: () => void;
}

const InboxContext = createContext<InboxContextValue | undefined>(undefined);

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<CityDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!user?.cityId) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    api
      .getDashboardStats(user.cityId)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.cityId, refreshKey]);

  useEffect(() => {
    if (!user?.cityId) return;
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [user?.cityId, refresh]);

  const value = useMemo<InboxContextValue>(
    () => ({
      stats,
      alerts: stats?.alerts ?? [],
      pendingReports: stats?.activeReportsCount ?? 0,
      pendingMessages: stats?.pendingContactMessagesCount ?? 0,
      pendingTotal: stats?.pendingTotalCount ?? 0,
      urgentCount: stats?.urgentAlertsCount ?? 0,
      isLoading,
      refresh,
    }),
    [stats, isLoading, refresh],
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used within InboxProvider");
  return ctx;
}
