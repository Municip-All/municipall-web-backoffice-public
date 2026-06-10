"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_POLL_INTERVAL_MS = 5000;

/** Rafraîchit une conversation tant que le panneau est ouvert (polling + onglet visible). */
export function useLiveChatRefresh(
  refresh: () => void | Promise<void>,
  enabled: boolean,
  intervalMs = DEFAULT_POLL_INTERVAL_MS,
) {
  const refreshRef = useRef(refresh);
  const enabledRef = useRef(enabled);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const runRefresh = useCallback(() => {
    if (!enabledRef.current) return;
    if (typeof document !== "undefined" && document.hidden) return;
    void refreshRef.current();
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    if (!enabledRef.current) return;
    intervalRef.current = setInterval(runRefresh, intervalMs);
  }, [intervalMs, runRefresh, stopPolling]);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }

    runRefresh();
    startPolling();

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        runRefresh();
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, runRefresh, startPolling, stopPolling]);
}
