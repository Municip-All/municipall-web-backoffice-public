"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="card-panel max-w-md p-8 text-center">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Une erreur est survenue</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Une erreur inattendue s&apos;est produite. Veuillez réessayer.</p>
        <button type="button" onClick={reset} className="btn-primary mt-6">Réessayer</button>
      </div>
    </div>
  );
}
