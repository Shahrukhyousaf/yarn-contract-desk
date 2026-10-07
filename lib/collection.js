const crypto = require("crypto");
const { getRedis } = require("./redis");

function makeId() {
  return crypto.randomBytes(12).toString("hex");
}

function parseVal(val) {
  if (val == null) return val;
  return typeof val === "string" ? JSON.parse(val) : val;
}

async function listCollection(name) {
  const redis = getRedis();
  const map = await redis.hgetall(name);
  if (!map) return [];
  return Object.entries(map).map(([id, val]) => ({ id, ...parseVal(val) }));
}

async function addToCollection(name, data) {
  const redis = getRedis();
  const id = makeId();
  await redis.hset(name, { [id]: JSON.stringify(data) });
  return id;
}

async function setInCollection(name, id, data) {
  const redis = getRedis();
  await redis.hset(name, { [id]: JSON.stringify(data) });
}

async function deleteFromCollection(name, id) {
  const redis = getRedis();
  await redis.hdel(name, id);
}

module.exports = { listCollection, addToCollection, setInCollection, deleteFromCollection, makeId };
