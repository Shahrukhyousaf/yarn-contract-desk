const { listCollection, addToCollection } = require("../lib/collection");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const items = await listCollection("sellers");
      res.status(200).json(items);
    } else if (req.method === "POST") {
      const id = await addToCollection("sellers", req.body || {});
      res.status(200).json({ id });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
