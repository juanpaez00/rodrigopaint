"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="rp-label">{label}</label>
      {children}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <Field label={label} className={className}>
      <input
        className="rp-input"
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <textarea
        className="rp-input resize-y"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SectionCard({
  num,
  title,
  children,
}: {
  num?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rp-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-rp-black to-[#2b2b2b] px-4 py-3">
        {num && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rp-red text-xs font-bold text-white">
            {num}
          </span>
        )}
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
