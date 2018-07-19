/**
 * Created by qzy on 2018/7/19.
 * File description:
 */
const {clearHash} = require('../services/cache');

module.exports = async (req, res, next) => {
  await next();

  clearHash(req.user.id);
}