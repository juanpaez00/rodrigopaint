"use client";

import type { FormData } from "./types";

// Re-comprime un dataURL (JPEG) a un tamaño más chico para la versión web.
// El PDF descargable sigue usando las fotos originales en alta calidad; esto
// es solo para lo que se guarda en Redis y se muestra en la web (más liviano,
// y así el request entra en el límite de 4.5 MB de las funciones de Vercel).
function recompressDataURL(
  dataURL: string,
  maxSize = 1000,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataURL.startsWith("data:image")) {
      resolve(dataURL);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height >= width && height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataURL);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

// Devuelve una copia del informe con las fotos optimizadas para web.
// croquisDibujo y firma quedan igual (son PNG con transparencia).
export async function optimizarParaWeb(data: FormData): Promise<FormData> {
  const cats = Object.keys(data.fotos) as (keyof FormData["fotos"])[];
  const fotos = { ...data.fotos };

  for (const cat of cats) {
    fotos[cat] = await Promise.all(
      data.fotos[cat].map((src) => recompressDataURL(src))
    );
  }

  return { ...data, fotos };
}
