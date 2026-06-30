"use client";

import { useEffect, useState } from "react";
import { generarSticker } from "@/lib/sticker";

export default function QRModal({
  orden,
  url,
  onClose,
}: {
  orden: number;
  url: string;
  onClose: () => void;
}) {
  const [sticker, setSticker] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let activo = true;
    generarSticker({ url })
      .then((d) => activo && setSticker(d))
      .catch(() => activo && setSticker(""));
    return () => {
      activo = false;
    };
  }, [url]);

  function descargarSticker() {
    if (!sticker) return;
    const a = document.createElement("a");
    a.href = sticker;
    a.download = `Sticker_RodrigoPaint_${orden}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Informe guardado
        </p>
        <p className="mt-1 text-2xl font-extrabold text-gray-900">
          Orden N° {orden}
        </p>

        <div className="mt-4 flex justify-center">
          {sticker ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={sticker}
              alt={`Sticker informe ${orden}`}
              className="max-h-80 w-auto rounded-lg border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="flex h-72 w-56 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-400">
              Generando sticker…
            </div>
          )}
        </div>

        <p className="mt-3 break-all text-xs text-gray-400">{url}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={descargarSticker}
            disabled={!sticker}
            className="col-span-2 rounded-lg bg-rp-red px-3 py-2.5 text-sm font-bold text-white transition hover:bg-(--rp-red-dark) disabled:opacity-60"
          >
            ⬇ Descargar sticker
          </button>
          <button
            onClick={copiar}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
          >
            {copiado ? "¡Copiado!" : "Copiar link"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
          >
            Ver informe
          </a>
          <button
            onClick={onClose}
            className="col-span-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:text-gray-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
