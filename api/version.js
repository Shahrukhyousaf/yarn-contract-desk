const { getVersions } = require("../lib/collection");

// Tiny "has anything changed?" check. Devices call this instead of re-downloading everything.
module.exports = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await getVersions());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
