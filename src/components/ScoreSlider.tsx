"use client";

function colorFor(v: number): string {
  if (v >= 8) return "#16a34a";
  if (v >= 6) return "#65a30d";
  if (v >= 4) return "#f59e0b";
  return "#dc2626";
}

export default function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span
          className="min-w-[2.75rem] rounded-md px-2 py-0.5 text-center text-sm font-bold text-white"
          style={{ background: colorFor(value) }}
        >
          {value}/10
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-rp-red"
        style={{ accentColor: colorFor(value) }}
      />
    </div>
  );
}
