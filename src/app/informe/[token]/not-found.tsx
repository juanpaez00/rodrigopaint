import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-color.png"
        alt="Rodrigo Paint"
        className="mb-6 h-12 w-auto"
      />
      <h1 className="text-2xl font-extrabold text-gray-800">
        Informe no encontrado
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        El link o código QR no corresponde a ningún informe. Verificá que esté
        completo o pedí uno nuevo.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-rp-red px-5 py-2.5 text-sm font-semibold text-white"
      >
        Ir al inicio
      </Link>
    </main>
  );
}
