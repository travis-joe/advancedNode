const mongoose = require('mongoose');
const redis = require('redis');
const exec = mongoose.Query.prototype.exec;
const util = require('util');

const {redisUrl} = require('../config/dev');
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
}
mongoose.Query.prototype.exec = async function () {
  // log(this.getQuery());
  // log(this.mongooseCollection.name);
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify({
    ...this.getQuery(), ...{
      collection: this.mongooseCollection.name
    }
  });

  const cached = await client.hget(this.hashKey, key);
  log(key, cached)
  if (cached) {
    const docs = JSON.parse(cached);
    return Array.isArray(docs) ?
        docs.map(d => new this.model(d)) :
        new this.model(JSON.parse(cached))
  }
  const result = await exec.apply(this, arguments);
  await client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};