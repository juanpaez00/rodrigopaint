"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { BODY_COLORS, BODY_COLOR_ORDER } from "@/lib/bodyParts";
import {
  CROQUIS_TYPES,
  CROQUIS_W,
  CROQUIS_H,
  croquisSrc,
  type VehicleType,
} from "@/lib/croquis";
import type { BodyColorKey } from "@/lib/types";

export default function Croquis({
  vehicleType,
  onChangeType,
  dibujo,
  onChange,
}: {
  vehicleType: VehicleType;
  onChangeType: (t: VehicleType) => void;
  dibujo: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState<BodyColorKey>("repintado");
  const [eraser, setEraser] = useState(false);

  // Carga inicial del dibujo guardado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (dibujo) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = dibujo;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function stroke(a: { x: number; y: number }, b: { x: number; y: number }) {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (eraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 24;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 6;
      ctx.strokeStyle = BODY_COLORS[color].fill;
    }
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    drawing.current = true;
    last.current = pos(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
    stroke(last.current, last.current);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    e.preventDefault();
    const p = pos(e);
    stroke(last.current!, p);
    last.current = p;
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    onChange(canvasRef.current!.toDataURL("image/png"));
  }

  function clearAll() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }

  return (
    <div className="space-y-4">
      {/* Selector de tipo */}
      <div>
        <p className="rp-label">Tipo de vehículo</p>
        <div className="grid grid-cols-3 gap-2">
          {CROQUIS_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeType(t.id)}
              className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                vehicleType === t.id
                  ? "border-rp-red bg-red-50 text-rp-red"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Herramientas de dibujo */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        {BODY_COLOR_ORDER.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setColor(k);
              setEraser(false);
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !eraser && color === k
                ? "border-gray-800 bg-white shadow-sm"
                : "border-transparent text-gray-600 hover:bg-white"
            }`}
          >
            <span
              className="inline-block h-3.5 w-3.5 rounded-full border border-gray-300"
              style={{ background: BODY_COLORS[k].fill }}
            />
            {BODY_COLORS[k].label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <button
          type="button"
          onClick={() => setEraser(true)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            eraser ? "border-gray-800 bg-white shadow-sm" : "border-transparent text-gray-600 hover:bg-white"
          }`}
        >
          🧽 Borrador
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-rp-red hover:underline"
        >
          Borrar todo
        </button>
      </div>

      {/* Ilustración + lienzo */}
      <div
        className="relative mx-auto w-full overflow-hidden rounded-xl border border-gray-200 bg-white"
        style={{ aspectRatio: `${CROQUIS_W} / ${CROQUIS_H}` }}
      >
        <img
          src={croquisSrc(vehicleType)}
          alt={`Croquis ${vehicleType}`}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain p-2"
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          width={CROQUIS_W}
          height={CROQUIS_H}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="absolute inset-0 h-full w-full touch-none"
          style={{ cursor: eraser ? "cell" : "crosshair" }}
        />
      </div>
      <p className="text-center text-xs text-gray-400">
        Elegí un color y dibujá sobre la pieza afectada. Usá el borrador para corregir.
      </p>
    </div>
  );
}
