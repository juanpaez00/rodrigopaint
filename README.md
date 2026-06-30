# Rodrigo Paint · Generador de Certificación de Usados

Aplicación web (Next.js) para que un inspector cargue una **revisión y certificación
vehicular premium** desde el celular o la tablet en el taller y genere un **PDF
profesional** con el logo de Rodrigo Paint, puntaje automático, croquis de carrocería,
fotos y firma.

El acceso se valida contra un archivo JSON. El PDF se arma en el navegador con
`@react-pdf/renderer`. Además, cada informe generado se **guarda en Redis** (Upstash)
con un **número de orden ascendente**, queda en un **historial** y genera un **código QR**
que abre una versión web pública del informe (sin la valoración comercial).

## Funcionalidades

- **Login simple** (usuario / contraseña) validado contra `src/data/usuarios.json`.
- **Carga de datos**: vehículo, cliente, fecha, patente, VIN, kilometraje, inspector.
- **Checklist por secciones**: mecánica/caja/electrónica, seguridad/chapa/tren,
  equipamiento, diagnóstico electrónico, verificación de kilometraje, neumáticos.
- **Puntuación automática** sobre 40 (4 áreas de 0 a 10) con resultado automático:
  - 36–40 → **Excelente**
  - 30–35 → **Muy bueno**
  - 20–29 → **Con observaciones**
  - menos de 20 → **No recomendado**
- **Croquis de carrocería** con **selector de tipo de vehículo** (sedán, coupé, SUV,
  pickup) e ilustración multi-vista en **5 vistas** (frente, trasera, ambos laterales y
  vista superior). El inspector **dibuja a mano alzada** sobre la pieza afectada con 4
  colores (verde original, amarillo repintado, naranja reparación menor, rojo reparación
  importante) + borrador. Las siluetas son vectores propios (sin licencia de terceros) y
  se renderizan idénticas en web y PDF.
  - ¿Querés otra ilustración? La silueta se genera en `src/lib/vehicles.ts` y se acomoda
    en `src/lib/croquisLayout.ts`. Para usar un SVG/imagen externo propio (con licencia),
    se reemplaza el fondo por esa imagen manteniendo la misma relación de aspecto del lienzo.
- **Fotos** por categoría (tablero, scanner, medición de pintura, carrocería, observaciones),
  comprimidas automáticamente.
- **Firma del inspector** dibujada en pantalla.
- **PDF final** con logo, número de informe, datos, puntaje, conclusión, croquis,
  fotos, firma y aclaración legal.
- **Borrador automático**: lo cargado se guarda en el navegador hasta tocar "Nuevo".
- **Guardado en la web + QR**: al generar el PDF, el informe se guarda en Redis con un
  número de orden ascendente y se muestra un **QR**. El QR lleva a una página pública
  (`/informe/<token>`) con el informe **sin la valoración comercial** (precios). La URL
  usa un token aleatorio, no el número de orden, para que no se puedan enumerar.
- **Historial** (`/historial`): lista de todos los informes guardados con su número de
  orden, puntaje, link y QR.

## Cómo correr en local

```bash
npm install
cp .env.example .env.local   # y completá las credenciales de Upstash (ver abajo)
npm run dev
```

Abrí http://localhost:3000 — te redirige al login.

> Sin las variables de Upstash, la app funciona y genera PDFs, pero al guardar mostrará
> un aviso de que no pudo guardar el informe en la web.

### Credenciales por defecto

- **Usuario:** `rodrigo`
- **Contraseña:** `rodrigopaint2026`

> ⚠️ Cambiá la contraseña antes de usarlo en producción (ver abajo).

## Configurar usuarios / contraseñas

Editá `src/data/usuarios.json`. Podés tener varios inspectores:

```json
{
  "usuarios": [
    {
      "usuario": "rodrigo",
      "clave": "una-clave-segura",
      "nombre": "Rodrigo Paint",
      "rolInspector": "Inspector Técnico"
    }
  ]
}
```

La validación es server-side (en `src/app/api/login/route.ts`), así que las claves
**no** se envían al navegador. Aun así, es un control de acceso básico (sin base de
datos ni hashing): suficiente para limitar el uso, no pensado para datos sensibles.

## Cambiar el logo

Los logos están en `public/brand/`:

- `logo-color.png` → logo sobre fondo claro (se usa en el PDF).
- `logo-dark.png` → logo sobre fondo oscuro (login y barra superior).

Reemplazá esos archivos manteniendo el nombre.

## Base de datos: Upstash Redis

Los informes guardados, el contador de número de orden y el historial viven en
**Upstash Redis** (Redis serverless, con free tier). Se conecta por dos variables de
entorno:

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Crear la base (gratis)

1. En el dashboard de tu proyecto en Vercel → pestaña **Storage** → **Create Database**
   → **Upstash for Redis** → seguí los pasos.
2. Vercel **inyecta automáticamente** `UPSTASH_REDIS_REST_URL` y
   `UPSTASH_REDIS_REST_TOKEN` en el proyecto. No hay que copiar nada a mano.
3. Para **desarrollo local**: copiá `.env.example` a `.env.local` y pegá los valores
   desde la pestaña `.env.local` de la base (en Upstash o en Vercel).

> El free tier alcanza ~50–80 informes (las fotos se guardan comprimidas). Si se llena,
> el paso siguiente es mover las fotos a Vercel Blob y dejar solo los datos en Redis.

### Cómo se guardan los datos (claves en Redis)

- `informe:seq` — contador `INCR` para el número de orden ascendente.
- `informe:<token>` — el informe completo (JSON), indexado por un token aleatorio.
- `informe:index` — lista de resúmenes para el historial (más nuevo primero).

## Deploy en Vercel

1. Subí el proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importá el repo.
3. Framework: **Next.js** (autodetectado).
4. Creá la base **Upstash for Redis** desde **Storage** (ver arriba) — las variables se
   configuran solas.
5. **Deploy.**

Para cambiar usuarios después del deploy, editá `src/data/usuarios.json` y volvé a
deployar (push al repo).

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- `@react-pdf/renderer` para el PDF (vectorial, generado en el cliente)
- Upstash Redis (`@upstash/redis`) para guardar informes / historial
- `qrcode` para generar el QR del informe web
