var _ = require('lodash')
  , cookie = require('cookie');

module.exports = function(options) {
  var options = _.defaults(options, { 
    key: 'pb.client', 
    transfer: [], 
    cookie: { 
      path: '/', 
      httpOnly: false, 
      maxAge: null
    }
  });

  return function(req, res, next) {
    req.clientSession = req.cookies[options.key] || {};

    res.on('header', function() {
      var clientSession = _.merge(req.clientSession, _.pick(req.session, options.transfer));

      res.cookie(options.key, clientSession, options.cookie);
    });

    next();
  };
};