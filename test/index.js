var should = require('should')
  , express = require('express')
  , cookie = require('cookie')
  , request = require('request')
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

var retrieveClientSession = function(res) {
  var cookies = cookie.parse(res.headers['set-cookie'].toString());
  console.log(cookies['pb.client']);
  return JSON.parse(cookies['pb.client']);
}

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
  req.clientSession.count = 1;
  res.send(200, 'ok');
});

before(function(done) {
  app.listen(port, done);
});

describe("Popbasic's client session manager", function(){
  it("should return client cookie with transfered data", function(done) {
    request(mkurl('/test/1'), function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      
      var clientSesson = retrieveClientSession(res);
      clientSesson.count.should.equal(1);
      clientSesson.ziggy.should.equal(true);
      done();
    });
  });
});