import { Redis } from "@upstash/redis";

// Cliente de Upstash Redis (REST). Se usa SOLO en el servidor.
// Las credenciales se configuran en Vercel (o en .env.local para desarrollo).
// Se aceptan los dos nombres posibles:
//   - La integración de Vercel (Marketplace) las inyecta como KV_REST_API_URL / KV_REST_API_TOKEN.
//   - El nombre nativo de Upstash es UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;

  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Faltan las credenciales de Redis (UPSTASH_REDIS_REST_URL/TOKEN o KV_REST_API_URL/TOKEN). " +
        "Configuralas en Vercel o en .env.local (ver .env.example)."
    );
  }

  client = new Redis({ url, token });
  return client;
}

// Claves de Redis usadas por la app
export const RK = {
  // Contador atómico para el número de orden ascendente (INCR)
  seq: "informe:seq",
  // Informe completo, indexado por su token público aleatorio
  informe: (token: string) => `informe:${token}`,
  // Lista de resúmenes para el historial (más nuevo primero)
  index: "informe:index",
};
