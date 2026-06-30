"use client";

import type { ItemStatus } from "@/lib/types";

const OPTS: { value: Exclude<ItemStatus, null>; color: string; ring: string; title: string }[] = [
  { value: "ok", color: "bg-green-500", ring: "ring-green-300", title: "Bien" },
  { value: "observacion", color: "bg-amber-400", ring: "ring-amber-300", title: "Observación" },
  { value: "critico", color: "bg-red-500", ring: "ring-red-300", title: "Crítico" },
];

export default function StatusRating({
  value,
  onChange,
}: {
  value: ItemStatus;
  onChange: (v: ItemStatus) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {OPTS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            title={o.title}
            onClick={() => onChange(active ? null : o.value)}
            className={`h-6 w-6 rounded-full ${o.color} transition ${
              active
                ? `ring-2 ring-offset-1 ${o.ring} opacity-100`
                : "opacity-30 hover:opacity-70"
            }`}
          />
        );
      })}
    </div>
  );
}
