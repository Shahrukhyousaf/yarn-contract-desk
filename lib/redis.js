const { Redis } = require("@upstash/redis");

let client;

function getRedis() {
  if (!client) {
    // Supports both the Vercel-managed Upstash integration (KV_REST_API_*)
    // and a directly-linked Upstash account (UPSTASH_REDIS_REST_*).
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        "Missing Redis credentials. In your Vercel project, go to Storage, add the Upstash integration, then redeploy."
      );
    }
    client = new Redis({ url, token });
  }
  return client;
}

module.exports = { getRedis };
