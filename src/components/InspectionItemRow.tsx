"use client";

import StatusRating from "./StatusRating";
import type { InspeccionItem, ItemStatus } from "@/lib/types";

export default function InspectionItemRow({
  name,
  item,
  onChange,
}: {
  name: string;
  item: InspeccionItem;
  onChange: (patch: Partial<InspeccionItem>) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800">{name}</span>
        <StatusRating
          value={item.status}
          onChange={(status: ItemStatus) => onChange({ status })}
        />
      </div>
      <textarea
        className="rp-input resize-y"
        rows={2}
        placeholder="Observaciones…"
        value={item.obs}
        onChange={(e) => onChange({ obs: e.target.value })}
      />
    </div>
  );
}
