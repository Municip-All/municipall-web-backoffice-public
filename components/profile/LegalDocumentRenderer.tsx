"use client";

import React from "react";
import type { LegalDocument } from "@/lib/legalContent";

export default function LegalDocumentRenderer({
  document,
}: {
  document: LegalDocument;
}) {
  return (
    <article className="space-y-8">
      <header className="border-b border-[var(--card-border)] pb-6">
        <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
          {document.title}
        </h2>
        <p className="mt-2 text-sm font-medium text-[var(--muted)]">
          {document.subtitle}
        </p>
      </header>

      {document.sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent)]">
            {section.title}
          </h3>
          {section.paragraphs?.map((p, i) => (
            <p
              key={i}
              className="text-sm font-medium leading-relaxed text-[var(--muted)] whitespace-pre-line"
            >
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul className="list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-[var(--muted)]">
              {section.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
