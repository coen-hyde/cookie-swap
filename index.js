var _ = require('lodash')
  , cookie = require('cookie');

module.exports = function(options) {
  var options = _.defaults(options, { 
    key: 'maxwell.sess', 
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
      // Transferable session properties taht will be copied to the client session
      var transerable = _.pick(req.session, options.transfer)
      
      // Transferable session properties that do not exist in the session and thus should be deleted in the client session
      var deleteProps = _.difference(options.transfer, _.keys(transerable));

      // The client session after processing
      var clientSession = _.omit(_.merge(req.clientSession, transerable), deleteProps);
      
      res.cookie(options.key, clientSession, options.cookie);
    });

    next();
  };
};