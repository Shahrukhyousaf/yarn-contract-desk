const { getRedis } = require("../lib/redis");

module.exports = async (req, res) => {
  try {
    const redis = await getRedis();
    if (req.method === "GET") {
      const raw = await redis.get("company");
      res.status(200).json(raw ? JSON.parse(raw) : {});
    } else if (req.method === "PUT") {
      await redis.set("company", JSON.stringify(req.body || {}));
      res.status(200).json({ ok: true });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
