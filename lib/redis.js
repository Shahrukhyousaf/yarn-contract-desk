const { createClient } = require("redis");

let client;
let connecting;

// Finds the Redis connection string Vercel injected (REDIS_URL, or a custom-prefixed name).
function findUrl() {
  for (const k of ["REDIS_URL", "STORAGE_URL", "KV_URL"]) {
    if (/^rediss?:\/\//.test(process.env[k] || "")) return process.env[k];
  }
  const key = Object.keys(process.env).find((k) => /^rediss?:\/\//.test(process.env[k] || ""));
  return key ? process.env[key] : undefined;
}

async function getRedis() {
  const url = findUrl();
  if (!url) {
    // Names only, never values.
    const seen = Object.keys(process.env).filter((k) => /REDIS|KV|UPSTASH|STORAGE/i.test(k));
    throw new Error(
      "Missing Redis connection string. Database-related variables this project can see: " +
        (seen.length ? seen.join(", ") : "none") +
        ". In Vercel, open the database under Storage, make sure it is connected to this project, then redeploy."
    );
  }
  if (!client) {
    client = createClient({
      url,
      socket: {
        connectTimeout: 8000,
        reconnectStrategy: (retries) => (retries > 2 ? new Error("Redis reconnect failed") : 200),
      },
    });
    client.on("error", (e) => console.error("Redis client error:", e.message));
  }
  if (!client.isOpen) {
    if (!connecting) connecting = client.connect().finally(() => { connecting = null; });
    await connecting;
  }
  return client;
}

module.exports = { getRedis };
