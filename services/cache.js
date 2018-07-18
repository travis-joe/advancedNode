const mongoose = require('mongoose');
const redis = require('redis');
const exec = mongoose.Query.prototype.exec;
const util = require('util');

const {redisUrl} = require('../config/dev');
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
mongoose.Query.prototype.cache = function () {
  this.useCache = true;
  return this;
}
mongoose.Query.prototype.exec = async function () {
  // log(this.getQuery());
  // log(this.mongooseCollection.name);
  if(!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify({
    ...this.getQuery(), ...{
      collection: this.mongooseCollection.name
    }
  });

  const cached = await client.get(key);
  if (cached) {
    const docs = JSON.parse(cached);
    return Array.isArray(docs) ?
        docs.map(d => new this.model(d)) :
        new this.model(JSON.parse(cached))
  }
  const result = await exec.apply(this, arguments);
  await client.set(key, JSON.stringify(result), 'EX', 10);
  return result;
};