const { clearHash } = require('../middleware/cache');

// await next() trick to execute function after request
module.exports = async (req, res, next) => {
  // console.log('running');
  await next();
  clearHash(req.user._id);
};