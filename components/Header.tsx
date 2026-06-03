"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { ViewType } from "./Sidebar";

interface HeaderProps {
  onViewChange: (view: ViewType) => void;
}

export default function Header({ onViewChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [cityName, setCityName] = useState<string>("");

  useEffect(() => {
    if (!user?.cityId) return;
    api
      .getCityConfig(user.cityId)
      .then((config) => {
        if (config) setCityName(config.name);
      })
      .catch(() => {});
  }, [user?.cityId]);

  return (
    <header className="relative z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--card-border)] bg-glass px-6 lg:px-8">
      <button
        type="button"
        onClick={() => onViewChange("pouls-ai")}
        className="min-w-0 text-left transition-opacity hover:opacity-80"
      >
        <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {cityName || "Votre commune"}
        </p>
        <p className="text-[11px] font-medium text-[var(--muted)]">
          Tableau de bord municipal
        </p>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-ghost !rounded-full !p-2.5"
          aria-label={theme === "light" ? "Mode sombre" : "Mode clair"}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onViewChange("profile")}
          className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-[var(--foreground)]">
              {user?.name
                ? `${user.name} ${user.surname || ""}`.trim()
                : "Agent"}
            </p>
            <p className="text-[11px] text-[var(--muted)]">
              {user?.role || "Service municipal"}
            </p>
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-[var(--card-border)] dark:bg-zinc-800">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[var(--accent)]">
                {(user?.name?.[0] || "A").toUpperCase()}
              </div>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={logout}
          className="btn-ghost !rounded-full !p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          aria-label="Se déconnecter"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
