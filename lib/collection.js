const crypto = require("crypto");
const { getRedis } = require("./redis");

function makeId() {
  return crypto.randomBytes(12).toString("hex");
}

async function listCollection(name) {
  const redis = await getRedis();
  const map = await redis.hGetAll(name);
  return Object.entries(map || {}).map(([id, val]) => ({ id, ...JSON.parse(val) }));
}

async function addToCollection(name, data) {
  const redis = await getRedis();
  const id = makeId();
  await redis.hSet(name, id, JSON.stringify(data));
  return id;
}

async function setInCollection(name, id, data) {
  const redis = await getRedis();
  await redis.hSet(name, id, JSON.stringify(data));
}

async function deleteFromCollection(name, id) {
  const redis = await getRedis();
  await redis.hDel(name, id);
}

module.exports = { listCollection, addToCollection, setInCollection, deleteFromCollection, makeId };
