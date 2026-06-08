"use client";

interface ColorHexFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export default function ColorHexField({
  label,
  value,
  onChange,
}: ColorHexFieldProps) {
  return (
    <div>
      <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </label>
      <div className="flex items-center gap-4 rounded-[22px] border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-sm">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-[14px] border border-[var(--card-border)] bg-transparent p-0"
        />
        <code className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]">
          {value}
        </code>
      </div>
    </div>
  );
}
