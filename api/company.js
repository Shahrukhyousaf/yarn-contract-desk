const { getRedis } = require("../lib/redis");
const { bump, getVersion } = require("../lib/collection");

module.exports = async (req, res) => {
  try {
    const redis = await getRedis();
    if (req.method === "GET") {
      const version = await getVersion("company");
      const raw = await redis.get("company");
      res.setHeader("X-Version", String(version));
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json(raw ? JSON.parse(raw) : {});
    } else if (req.method === "PUT") {
      await redis.set("company", JSON.stringify(req.body || {}));
      await bump("company");
      res.status(200).json({ ok: true });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
