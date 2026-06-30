"use client";

import { useRef, useState } from "react";
import { fileToCompressedDataURL } from "@/lib/image";

export default function PhotoUpload({
  label,
  fotos,
  onChange,
  max = 6,
}: {
  label: string;
  fotos: string[];
  onChange: (fotos: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      const slots = Math.max(0, max - fotos.length);
      const toAdd = Array.from(files).slice(0, slots);
      const results = await Promise.all(
        toAdd.map((f) => fileToCompressedDataURL(f).catch(() => null))
      );
      const valid = results.filter((r): r is string => !!r);
      onChange([...fotos, ...valid]);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(idx: number) {
    onChange(fotos.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">
          {fotos.length}/{max}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {fotos.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${label} ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-90 transition hover:bg-rp-red"
            >
              ✕
            </button>
          </div>
        ))}

        {fotos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-rp-red hover:text-rp-red disabled:opacity-50"
          >
            <span className="text-2xl leading-none">＋</span>
            <span className="mt-1 text-[10px]">{loading ? "…" : "Agregar"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
