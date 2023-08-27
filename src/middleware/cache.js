const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const { exec } = mongoose.Query.prototype;
//const { populate } = mongoose.Document.prototype;
// Setup REDIS + promisify get function
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);


mongoose.Query.prototype.cache = function cache(options = {}) {
  // this equals query instance
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  // return makes it chainable
  return this;
};

mongoose.Query.prototype.exec = async function execAndCache(...args) {
  if (!this.useCache) {
    return exec.apply(this, args);
  }
  const key = JSON.stringify(Object.assign({}, this.getFilter(), {
    collection: this.mongooseCollection.name
  }));

  const cachedValue = await client.hget(this.hashKey, key);
  if (cachedValue) {
    // Function expects to return a Mongoose object.
    // Mongoose model with properties like get, get, etc.
    const doc = JSON.parse(cachedValue);
    const cachedDocument = Array.isArray(doc) 
      ? doc.map(d => new this.model(d)) // array of objects converted to this model
      : new this.model(doc);
    return cachedDocument;
  }

  // If not there execute query and cache result.
  const result = await exec.apply(this, args);
  client.hset(this.hashKey, key, JSON.stringify(result));
  return result;
};
/*
mongoose.Document.prototype.populate = async function execPCache(...args) {
console.log(this)
return populate.apply(this, args);
}*/

const clearHash = (hashKey) => {
  client.del(JSON.stringify(hashKey));
};

module.exports = { 
  clearHash
};
