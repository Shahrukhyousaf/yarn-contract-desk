const { Redis } = require("@upstash/redis");

let client;

// Finds the first environment variable whose name matches one of the patterns.
// This copes with Vercel's optional custom prefix (e.g. STORAGE_KV_REST_API_URL).
function findEnv(patterns) {
  const keys = Object.keys(process.env);
  for (const p of patterns) {
    const key = keys.find((k) => p.test(k) && process.env[k]);
    if (key) return process.env[key];
  }
  return undefined;
}

function getRedis() {
  if (!client) {
    const url = findEnv([/^KV_REST_API_URL$/, /^UPSTASH_REDIS_REST_URL$/, /REST_API_URL$/, /REST_URL$/]);
    const token = findEnv([/^KV_REST_API_TOKEN$/, /^UPSTASH_REDIS_REST_TOKEN$/, /REST_API_TOKEN$/, /REST_TOKEN$/]);
    if (!url || !token) {
      // Names only, never values, so this is safe to show.
      const seen = Object.keys(process.env).filter((k) => /REDIS|KV|UPSTASH|STORAGE/i.test(k));
      throw new Error(
        "Missing Redis credentials. Database-related variables this project can see: " +
          (seen.length ? seen.join(", ") : "none") +
          ". In Vercel, open the database under Storage and make sure it is connected to this project, then redeploy."
      );
    }
    client = new Redis({ url, token });
  }
  return client;
}

module.exports = { getRedis };
