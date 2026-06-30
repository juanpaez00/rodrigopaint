"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { obtenerSesion } from "@/lib/session";
import type { InformeResumen } from "@/lib/types";
import QRModal from "@/components/QRModal";

export default function HistorialPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<InformeResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrInfo, setQrInfo] = useState<{
    orden: number;
    url: string;
  } | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!obtenerSesion()) {
      router.replace("/login");
      return;
    }
    setReady(true);

    fetch("/api/informes")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setItems(json.items as InformeResumen[]);
        else setError(json.error || "No se pudo cargar el historial.");
      })
      .catch(() => setError("No se pudo conectar con el servidor."))
      .finally(() => setLoading(false));
  }, [router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Cargando…
      </div>
    );
  }

  function verQR(item: InformeResumen) {
    setQrInfo({
      orden: item.orden,
      url: `${window.location.origin}/informe/${item.token}`,
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <header className="sticky top-0 z-20 border-b border-gray-800 bg-rp-black">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Image
            src="/brand/logo-dark.png"
            alt="Rodrigo Paint"
            width={200}
            height={71}
            priority
            className="h-9 w-auto"
          />
          <Link
            href="/"
            className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:border-rp-red hover:text-white"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        <h1 className="mb-4 text-lg font-extrabold text-gray-800">
          Historial de informes
        </h1>

        {loading && <p className="text-sm text-gray-400">Cargando informes…</p>}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-rp-red">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="rounded-lg bg-white px-4 py-8 text-center text-sm text-gray-400">
            Todavía no hay informes guardados. Generá un PDF y aparecerá acá.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item) => {
            const vehiculo =
              [item.marcaModelo, item.anio].filter(Boolean).join(" ") ||
              "Vehículo sin datos";
            return (
              <div
                key={item.token}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center"
              >
                <div
                  className="flex h-12 w-14 flex-col items-center justify-center rounded-lg text-white"
                  style={{ background: item.color }}
                >
                  <span className="text-lg font-extrabold leading-none">
                    {item.total}
                  </span>
                  <span className="text-[9px] opacity-90">/40</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-gray-800">
                      N° {item.orden}
                    </span>
                    <span className="truncate text-sm text-gray-600">
                      {vehiculo}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-400">
                    {[item.cliente, item.dominio, item.fecha]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/informe/${item.token}`}
                    target="_blank"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400"
                  >
                    Ver
                  </Link>
                  <button
                    onClick={() => verQR(item)}
                    className="rounded-lg bg-rp-red px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-(--rp-red-dark)"
                  >
                    QR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {qrInfo && (
        <QRModal
          orden={qrInfo.orden}
          url={qrInfo.url}
          onClose={() => setQrInfo(null)}
        />
      )}
    </div>
  );
}
