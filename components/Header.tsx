"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { LogOut, Moon, Sun, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { ViewType } from "./Sidebar";
import NotificationCenter from "@/components/NotificationCenter";
import { roleLabel } from "@/lib/roleLabels";

interface HeaderProps {
  onViewChange: (view: ViewType) => void;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  mobileNavOpen?: boolean;
}

export default function Header({
  onViewChange,
  onMenuToggle,
  menuOpen,
  mobileNavOpen,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [cityName, setCityName] = useState<string>("");

  useEffect(() => {
    if (!user?.cityId) return;
    let cancelled = false;
    api
      .getCityConfig(user.cityId)
      .then((config) => {
        if (cancelled) return;
        if (config) setCityName(config.name);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.cityId]);

  const showCloseIcon = mobileNavOpen || menuOpen;

  return (
    <header
      className="relative z-50 flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--card-border)] bg-glass px-4 sm:px-6 lg:px-8"
      role="banner"
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="btn-ghost !min-h-[44px] !min-w-[44px] !p-2"
          aria-label={
            showCloseIcon
              ? "Fermer le menu de navigation"
              : "Ouvrir le menu de navigation"
          }
          aria-controls="app-sidebar"
          aria-expanded={menuOpen ?? false}
        >
          {showCloseIcon ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>

        <button
          type="button"
          onClick={() => onViewChange("pouls-ai")}
          className="min-w-0 text-left transition-opacity hover:opacity-80"
        >
          <p className="font-display text-lg font-bold tracking-tight text-[var(--foreground)]">
            {cityName || "Votre commune"}
          </p>
          <p className="text-xs font-medium text-[var(--muted)]">
            Tableau de bord municipal
          </p>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <NotificationCenter onViewChange={onViewChange} />

        <button
          type="button"
          onClick={toggleTheme}
          className="btn-ghost !rounded-full !p-2.5"
          aria-label={
            theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"
          }
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" aria-hidden />
          ) : (
            <Sun className="h-4 w-4" aria-hidden />
          )}
        </button>

        <button
          type="button"
          onClick={() => onViewChange("profile")}
          className="flex min-h-[44px] items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-[var(--surface-subtle)]"
          aria-label="Mon profil"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-[var(--foreground)]">
              {user?.name
                ? `${user.name} ${user.surname || ""}`.trim()
                : "Agent"}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {user?.role ? roleLabel(user.role) : "Service municipal"}
            </p>
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-[var(--accent)] ring-1 ring-[var(--accent)]/30">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-sm font-bold"
                style={{ color: "var(--color-on-brand)" }}
                aria-hidden
              >
                {(user?.name?.[0] || "A").toUpperCase()}
              </div>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={logout}
          className="btn-ghost !rounded-full !p-2.5 text-[var(--color-danger)] hover:bg-red-50 hover:text-[var(--color-danger)] dark:hover:bg-red-950/30"
          aria-label="Se déconnecter"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </header>
  );
}
