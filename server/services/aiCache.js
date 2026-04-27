const cache = new Map();

const CACHE_DURATION = 5 * 60 * 1000;

function getCache(key) {

  const data = cache.get(key);

  if (!data) return null;

  const expired = Date.now() - data.time > CACHE_DURATION;

  if (expired) {
    cache.delete(key);
    return null;
  }

  return data.value;
}

function setCache(key, value) {

  cache.set(key, {
    value,
    time: Date.now()
  });

}

module.exports = { getCache, setCache };