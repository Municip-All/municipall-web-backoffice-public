"use client";

import React from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";

type ProfileSubHeaderProps = {
  title: string;
  subtitle: string;
  showBack?: boolean;
  onBack: () => void;
  showSave?: boolean;
  saving?: boolean;
  onSave?: () => void;
  saveLabel?: string;
};

export default function ProfileSubHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  showSave = false,
  saving = false,
  onSave,
  saveLabel = "Enregistrer",
}: ProfileSubHeaderProps) {
  return (
    <header className="mb-12 flex items-center justify-between">
      <div>
        <div className="mb-3 flex items-center gap-4">
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] shadow-sm transition-all hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <p className="text-apple-muted opacity-60">{subtitle}</p>
        </div>
        <h1 className="text-apple-title">{title}</h1>
      </div>
      {showSave && onSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saveLabel}
        </button>
      )}
    </header>
  );
}
