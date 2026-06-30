"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { guardarSesion } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, clave }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }
      guardarSesion(data.usuario);
      router.push("/");
    } catch {
      setError("No se pudo conectar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-rp-black px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image
            src="/brand/logo-dark.png"
            alt="Rodrigo Paint"
            width={320}
            height={113}
            priority
            className="h-auto w-64"
          />
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-2xl">
          <h1 className="text-center text-lg font-bold text-gray-900">
            Certificación de Usados
          </h1>
          <p className="mb-6 text-center text-xs text-gray-500">
            Acceso para inspectores
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="rp-label">Usuario</label>
              <input
                className="rp-input"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoCapitalize="none"
                autoComplete="username"
                placeholder="usuario"
              />
            </div>
            <div>
              <label className="rp-label">Contraseña</label>
              <input
                className="rp-input"
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-rp-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-rp-red py-2.5 text-sm font-semibold text-white transition hover:bg-(--rp-red-dark) disabled:opacity-60"
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-500">
          Rodrigo Paint · Santa Fe 2137 · San Miguel de Tucumán
        </p>
      </div>
    </main>
  );
}
