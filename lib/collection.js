const crypto = require("crypto");
const { getRedis } = require("./redis");

// Collections the app stores, plus "company" (a single record). Each has a small version counter
// that goes up on every change, so devices can ask "has anything changed?" cheaply.
const ALLOWED = ["sellers", "buyers", "qualities", "contracts", "dispatches"];
const VERSIONED = [...ALLOWED, "company"];

function makeId() {
  return crypto.randomBytes(12).toString("hex");
}

async function bump(name) {
  const redis = await getRedis();
  await redis.incr("ver:" + name);
}

async function getVersion(name) {
  const redis = await getRedis();
  return Number(await redis.get("ver:" + name)) || 0;
}

async function getVersions() {
  const redis = await getRedis();
  const vals = await redis.mGet(VERSIONED.map((n) => "ver:" + n));
  const out = {};
  VERSIONED.forEach((n, i) => { out[n] = Number(vals[i]) || 0; });
  return out;
}

async function listCollection(name) {
  const redis = await getRedis();
  const map = await redis.hGetAll(name);
  return Object.entries(map || {}).map(([id, val]) => ({ id, ...JSON.parse(val) }));
}

function withoutId(data) {
  const copy = Object.assign({}, data || {});
  delete copy.id;
  return copy;
}

async function addToCollection(name, data) {
  const redis = await getRedis();
  const id = makeId();
  await redis.hSet(name, id, JSON.stringify(withoutId(data)));
  await bump(name);
  return id;
}

async function addManyToCollection(name, items) {
  const redis = await getRedis();
  const ids = [];
  const m = redis.multi();
  (items || []).forEach((item) => {
    const id = makeId();
    ids.push(id);
    m.hSet(name, id, JSON.stringify(withoutId(item)));
  });
  if (ids.length) await m.exec();
  await bump(name);
  return ids;
}

async function setInCollection(name, id, data) {
  const redis = await getRedis();
  await redis.hSet(name, id, JSON.stringify(withoutId(data)));
  await bump(name);
}

async function deleteFromCollection(name, id) {
  const redis = await getRedis();
  await redis.hDel(name, id);
  await bump(name);
}

// Used by "Restore from backup": writes records with their original ids.
async function restoreItems(name, items) {
  const redis = await getRedis();
  const m = redis.multi();
  let count = 0;
  (items || []).forEach((item) => {
    if (!item || !item.id) return;
    m.hSet(name, String(item.id), JSON.stringify(withoutId(item)));
    count++;
  });
  if (count) await m.exec();
  await bump(name);
  return count;
}

module.exports = {
  ALLOWED, VERSIONED, makeId, bump, getVersion, getVersions,
  listCollection, addToCollection, addManyToCollection, setInCollection, deleteFromCollection, restoreItems,
};
