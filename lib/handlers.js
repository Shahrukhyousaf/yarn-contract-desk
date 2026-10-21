const c = require("./collection");
const { getRedis } = require("./redis");

// ONE router for the whole API. Vercel's free (Hobby) plan allows at most 12 serverless functions,
// so instead of one file per route, everything is served by api/[...slug].js, which calls this.
// New endpoints belong here, never as new files in /api.

async function listRoute(name, req, res) {
  if (req.method === "GET") {
    const version = await c.getVersion(name); // read first: if data changes meanwhile we just refetch later
    const items = await c.listCollection(name);
    res.setHeader("X-Version", String(version));
    return res.status(200).json(items);
  }
  if (req.method === "POST") {
    const body = req.body || {};
    if (Array.isArray(body.items)) {
      const ids = await c.addManyToCollection(name, body.items);
      return res.status(200).json({ ids });
    }
    const id = await c.addToCollection(name, body);
    return res.status(200).json({ id });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function itemRoute(name, id, req, res) {
  if (req.method === "PUT") {
    await c.setInCollection(name, id, req.body || {});
    return res.status(200).json({ ok: true });
  }
  if (req.method === "DELETE") {
    await c.deleteFromCollection(name, id);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function companyRoute(req, res) {
  const redis = await getRedis();
  if (req.method === "GET") {
    const version = await c.getVersion("company");
    const raw = await redis.get("company");
    res.setHeader("X-Version", String(version));
    return res.status(200).json(raw ? JSON.parse(raw) : {});
  }
  if (req.method === "PUT") {
    await redis.set("company", JSON.stringify(req.body || {}));
    await c.bump("company");
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function versionRoute(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  return res.status(200).json(await c.getVersions());
}

async function restoreRoute(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body || {};
  if (body.company && typeof body.company === "object") {
    const redis = await getRedis();
    await redis.set("company", JSON.stringify(body.company));
    await c.bump("company");
    return res.status(200).json({ ok: true });
  }
  if (!c.ALLOWED.includes(body.collection) || !Array.isArray(body.items)) {
    return res.status(400).json({ error: "Nothing to restore" });
  }
  const count = await c.restoreItems(body.collection, body.items);
  return res.status(200).json({ ok: true, count });
}

module.exports = async function route(req, res) {
  try {
    res.setHeader("Cache-Control", "no-store");
    const parts = new URL(req.url, "http://localhost").pathname
      .replace(/^\/api\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    const [name, id] = parts;
    if (parts.length === 1 && name === "version") return await versionRoute(req, res);
    if (parts.length === 1 && name === "restore") return await restoreRoute(req, res);
    if (parts.length === 1 && name === "company") return await companyRoute(req, res);
    if (c.ALLOWED.includes(name) && parts.length === 1) return await listRoute(name, req, res);
    if (c.ALLOWED.includes(name) && parts.length === 2) return await itemRoute(name, id, req, res);
    return res.status(404).json({ error: "Not found" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
