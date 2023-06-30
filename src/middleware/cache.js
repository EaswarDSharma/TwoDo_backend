const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const { exec } = mongoose.Query.prototype;
//const { populate } = mongoose.Document.prototype;
// Setup REDIS + promisify get function
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

// REMINDER https://bit.ly/2qEmUkN
// Arrow function vs function declaration / expressions:
// Are they equivalent / exchangeable?
// Arrow functions and function declarations / expressions
// are not equivalent and cannot be replaced blindly.
// If the function you want to replace does not use this,
// arguments and is not called with new, then yes.

mongoose.Query.prototype.cache = function cache(options = {}) {
    //console.log("cache func")
  // this equals query instance
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  //console.log(this.hashKey)
  // return makes it chainable
  return this;
};

mongoose.Query.prototype.exec = async function execAndCache(...args) {
  if (!this.useCache) {
      //console.log("exit cache")
    return exec.apply(this, args);
  }
  const key = JSON.stringify(Object.assign({}, this.getQuery(), { //use getFilter() instead, this one removed in future
    collection: this.mongooseCollection.name
  }));
  // Search cache.      
  //console.log(JSON.stringify(this.getQuery())+"from haskey cache")

  const cachedValue = await client.hget(this.hashKey, key);
  if (cachedValue) {
    // Function expects to return a Mongoose object.
    // Mongoose model with properties like get, get, etc.
    const doc = JSON.parse(cachedValue);
    /* eslint-disable */
    const cachedDocument = Array.isArray(doc) 
      ? doc.map(d => new this.model(d)) // array of objects converted to this model
      : new this.model(doc);
    /* eslint-enable */
    // return JSON.parse(cachedValue);
    //console.log("from cache")
    return cachedDocument;
  }

  // If not there execute query and cache result.
  //console.log("cache-ing")

  const result = await exec.apply(this, args);
  client.hset(this.hashKey, key, JSON.stringify(result));
  //const r = await client.hget(this.hashKey,key)
  //console.log(r)
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
