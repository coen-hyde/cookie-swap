var should = require('should')
  , express = require('express')
  , cookie = require('cookie')
  , request = require('request')
  , _ = require('lodash')
  , clientSessions = require('../');

var host = '127.0.0.1'
  , port = 8099

var mkurl = function(path) {
  path = path || '/'

  return 'http://'+host+':'+port+path
};

var parseJSONCookie = function(str) {
  if (0 == str.indexOf('j:')) {
    try {
      return JSON.parse(str.slice(2));
    } catch (err) {
      // no op
    }
  }
};

var retrieveSessions = function(res) {
  var cookies = cookie.parse(res.headers['set-cookie'].toString());
  return _.pick(cookies, ['pb.client', 'connect.sess']);
};

var parsedClientSession = function(res) {
  return parseJSONCookie(retrieveSessions(res)['pb.client']);
};

var serializeClientSession = function(session) {
  return 'j:'+JSON.stringify(session);
};

var makeRequest = function(method, path, data, headers, cb) {
  headers = headers || {};

  var options = {
    uri: mkurl(path),
    method: method,
    headers: headers,
    jar: false
  };

  if (data) {
    options['body'] = JSON.stringify(data);
  }

  request(options, function(err, res, body) {
    // parse body if json request
    if (body && res.headers['content-type'].indexOf('application/json') != -1) {
      body = JSON.parse(body);
    }

    cb(err, res, body);
  });
};


app = express();

app.use(express.cookieParser());

app.use(express.cookieSession({
  secret: 'mysecretkey'
}));

app.use(clientSessions({
  transfer: ['ziggy']
}));

app.get('/test/1', function(req, res) {
  req.session.ziggy = true;
  req.session.zaggy = true;
  req.clientSession.count = 1;
  res.send(200, 'ok');
});

app.get('/test/2', function(req, res) {
  delete req.session.ziggy;
  req.clientSession.count += 3;
  res.send(200, 'ok');
});

before(function(done) {
  app.listen(port, done);
});

describe("Popbasic's client session manager", function(){
  it("should return client cookie with transfered data", function(done) {
    makeRequest('GET', '/test/1', null, null, function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.equal(200);

      var clientSession = parsedClientSession(res);
      clientSession.count.should.equal(1);
      clientSession.ziggy.should.equal(true);
      should.not.exist(clientSession.zaggy);
      done();
    });
  });

  it ("should remove transferable session properties from client session when they are deleted in server session" , function(done) {
    makeRequest('GET', '/test/1', null, null, function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.equal(200);

      var sessions = retrieveSessions(res);
      // Update a client session cookie to ensure server accepts the new value
      sessions['pb.client'] = serializeClientSession(
        _.extend(
          parseJSONCookie(sessions['pb.client']), 
          {count: 6}
        )
      );
      
      sessions = _.map(sessions, function(value, key) {
        return cookie.serialize(key, value);
      }).join('; ');

      makeRequest('GET', '/test/2', null, { 'Cookie': sessions }, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);

        var clientSession = parsedClientSession(res);
        clientSession.count.should.equal(9);
        should.not.exist(clientSession.ziggy);
        done();
      });
    });
  });
});