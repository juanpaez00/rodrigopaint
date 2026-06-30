import { NextResponse } from "next/server";
import usuariosData from "@/data/usuarios.json";

export async function POST(request: Request) {
  let body: { usuario?: string; clave?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida" }, { status: 400 });
  }

  const usuario = (body.usuario ?? "").trim().toLowerCase();
  const clave = body.clave ?? "";

  const match = usuariosData.usuarios.find(
    (u) => u.usuario.toLowerCase() === usuario && u.clave === clave
  );

  if (!match) {
    return NextResponse.json(
      { ok: false, error: "Usuario o contraseña incorrectos" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    usuario: {
      usuario: match.usuario,
      nombre: match.nombre,
      rolInspector: match.rolInspector,
    },
  });
}
