const { getRedis } = require("../lib/redis");
const { ALLOWED, restoreItems, bump } = require("../lib/collection");

// Used by "Restore from backup". Receives one collection (in small chunks) or the company record.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = req.body || {};
    if (body.company && typeof body.company === "object") {
      const redis = await getRedis();
      await redis.set("company", JSON.stringify(body.company));
      await bump("company");
      return res.status(200).json({ ok: true });
    }
    if (!ALLOWED.includes(body.collection) || !Array.isArray(body.items)) {
      return res.status(400).json({ error: "Nothing to restore" });
    }
    const count = await restoreItems(body.collection, body.items);
    res.status(200).json({ ok: true, count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
