const { setInCollection, deleteFromCollection } = require("../../lib/collection");

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === "PUT") {
      await setInCollection("buyers", id, req.body || {});
      res.status(200).json({ ok: true });
    } else if (req.method === "DELETE") {
      await deleteFromCollection("buyers", id);
      res.status(200).json({ ok: true });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
