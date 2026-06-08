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
  const cityId = user?.cityId;
  const [stats, setStats] = useState<CityDashboardStats | null>(null);
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const fetchKey = cityId ? `${cityId}:${refreshKey}` : null;
  const isLoading = Boolean(fetchKey) && readyKey !== fetchKey;

  useEffect(() => {
    if (!cityId || !fetchKey) return;

    let cancelled = false;
    void api
      .getDashboardStats(cityId)
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setReadyKey(fetchKey);
        }
      })
      .catch(() => {
        if (!cancelled) setReadyKey(fetchKey);
      });

    return () => {
      cancelled = true;
    };
  }, [cityId, fetchKey]);

  useEffect(() => {
    if (!user?.cityId) return;
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [user?.cityId, refresh]);

  const effectiveStats = cityId ? stats : null;

  const value = useMemo<InboxContextValue>(
    () => ({
      stats: effectiveStats,
      alerts: effectiveStats?.alerts ?? [],
      pendingReports: effectiveStats?.activeReportsCount ?? 0,
      pendingMessages: effectiveStats?.pendingContactMessagesCount ?? 0,
      pendingTotal: effectiveStats?.pendingTotalCount ?? 0,
      urgentCount: effectiveStats?.urgentAlertsCount ?? 0,
      isLoading,
      refresh,
    }),
    [effectiveStats, isLoading, refresh],
  );

  return (
    <InboxContext.Provider value={value}>{children}</InboxContext.Provider>
  );
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used within InboxProvider");
  return ctx;
}
