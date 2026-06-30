"use client";

import QRCode from "qrcode";

// Genera un sticker cuadrado-vertical listo para imprimir, con la marca de
// Rodrigo Paint: franja negra con logo, QR (con el logo al centro) que lleva al
// informe del auto, y pie con los íconos de Instagram y WhatsApp.

const W = 1080;
const H = 1360;
const FOOT_H = 140;
const RED = "#e11414";
const BLACK = "#000000"; // negro puro, igual al fondo del logo, para que se funda
const GREEN = "#25d366"; // verde WhatsApp
const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Dibuja una imagen centrada en (cx, cy) escalada para entrar en maxW × maxH.
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  maxW: number,
  maxH: number
) {
  const r = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * r;
  const h = img.height * r;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Ícono de Instagram (línea blanca): cuadrado redondeado + círculo + punto.
function drawInstagram(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(3, r * 0.16);
  ctx.lineJoin = "round";
  roundRect(ctx, cx - r, cy - r, r * 2, r * 2, r * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r * 0.52, cy - r * 0.52, r * 0.13, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

// Ícono de WhatsApp: círculo verde con auricular blanco.
function drawWhatsApp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  ctx.save();
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Auricular (de abajo-izquierda hacia arriba-derecha)
  ctx.strokeStyle = "#ffffff";
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.24;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.3, cy + r * 0.34);
  ctx.quadraticCurveTo(cx - r * 0.02, cy - r * 0.02, cx + r * 0.3, cy - r * 0.34);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy + r * 0.34, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy - r * 0.34, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export interface StickerData {
  url: string;
}

export async function generarSticker({ url }: StickerData): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el sticker.");

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Fondo blanco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Header: el logo-dark se dibuja a sangre completa (borde a borde), así la
  // imagen ES la franja negra y no queda ningún recuadro alrededor del logo.
  let headerH = 360;
  try {
    const logoDark = await loadImage("/brand/logo-dark.png");
    headerH = Math.round((W * logoDark.height) / logoDark.width);
    ctx.drawImage(logoDark, 0, 0, W, headerH);
  } catch {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, W, headerH);
  }
  // Línea roja debajo del header
  ctx.fillStyle = RED;
  ctx.fillRect(0, headerH, W, 8);

  // QR con corrección de errores alta (H) para tolerar el logo en el centro
  const qrSize = 740;
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: qrSize,
    color: { dark: BLACK, light: "#ffffff" },
  });
  const qrImg = await loadImage(qrDataUrl);
  const qrX = (W - qrSize) / 2;
  // Centrado vertical entre la línea roja y el pie
  const zonaTop = headerH + 8;
  const zonaBottom = H - FOOT_H;
  const qrY = zonaTop + (zonaBottom - zonaTop - qrSize) / 2;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Logo de color sobre un recuadro blanco en el centro del QR
  const cx = W / 2;
  const cy = qrY + qrSize / 2;
  const boxW = 232;
  const boxH = 138;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, 18);
  ctx.fill();
  try {
    const logoColor = await loadImage("/brand/logo-color.png");
    drawContain(ctx, logoColor, cx, cy, boxW - 40, boxH - 44);
  } catch {
    /* si falla, queda el recuadro blanco */
  }

  // Franja inferior negra con íconos de Instagram y WhatsApp
  const footY = H - FOOT_H;
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, footY, W, FOOT_H);

  const yc = footY + FOOT_H / 2;
  const iconR = 28;
  const gapIconText = 16;
  const gapGroups = 56;
  const igText = "@rodrigo.paint";
  const waText = "381 624 2542";

  ctx.font = `600 32px ${FONT}`;
  const igW = iconR * 2 + gapIconText + ctx.measureText(igText).width;
  const waW = iconR * 2 + gapIconText + ctx.measureText(waText).width;
  const totalW = igW + gapGroups + waW;
  let x = (W - totalW) / 2;

  ctx.textAlign = "left";
  // Instagram
  drawInstagram(ctx, x + iconR, yc, iconR);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(igText, x + iconR * 2 + gapIconText, yc + 1);
  x += igW + gapGroups;
  // WhatsApp
  drawWhatsApp(ctx, x + iconR, yc, iconR);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(waText, x + iconR * 2 + gapIconText, yc + 1);

  return canvas.toDataURL("image/png");
}
