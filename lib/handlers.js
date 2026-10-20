const c = require("./collection");

// /api/<name>  — list (GET), add one (POST), add many (POST with {items:[...]})
function listHandler(name) {
  return async (req, res) => {
    try {
      if (req.method === "GET") {
        const version = await c.getVersion(name); // read first: if data changes meanwhile we just refetch later
        const items = await c.listCollection(name);
        res.setHeader("X-Version", String(version));
        res.setHeader("Cache-Control", "no-store");
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
      res.status(405).json({ error: "Method not allowed" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  };
}

// /api/<name>/<id>  — update (PUT) or delete (DELETE)
function itemHandler(name) {
  return async (req, res) => {
    const { id } = req.query;
    try {
      if (req.method === "PUT") {
        await c.setInCollection(name, id, req.body || {});
        return res.status(200).json({ ok: true });
      }
      if (req.method === "DELETE") {
        await c.deleteFromCollection(name, id);
        return res.status(200).json({ ok: true });
      }
      res.status(405).json({ error: "Method not allowed" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  };
}

module.exports = { listHandler, itemHandler };
