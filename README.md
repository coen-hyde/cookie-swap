Cookie Swap - Client Session Manager
===============================

This library helps to manage a client session cookie in node.js outside of connect/express sessions. It is desirable to maintain a htttpOnly cookie for express sessions (to auth users and prevent replay attacks by snatching the cookie via XSS) while at the same time storing some session state in a cookie that is accessable and modifiable to the client. 

The client session is avaliable at `req.clientSession`, similar to `req.session` for regular session state in connect/express. 

If you have some session state that should be accessable on the client but you do not want to accept any modification of the information when in comes back to the server, you can store it in `req.session` and add its property name to the option `transfer`. This will copy the property from req.session into req.clientSession.

![npm tag](https://nodei.co/npm/cookie-swap.png)

Install
-------

    $ npm install cookie-swap

Usage
-----

``` js
var express = require('express')
  , clientSessions = require('cookie-swap');

var app = express();

// Cookie parser is required and must be used before clientSessions
app.use(express.cookieParser());

// Client sessions can work alongside regular express cookie sessions
app.use(express.cookieSession({secret: 'mysecretkey'}));

app.use(clientSessions({
  transfer: [ 'name' ]
}));

// Now you can access the client session from the request object
app.get('/route', function(req, res) {
  // Set values on the client session cookie
  res.clientSession.zig = 'zag';

  // Set values on the regular session but have it transfered to the client session
  req.session.name = 'Roger'
});
```

Options
-------

* `key` cookie name defaulting to maxwell.sess
* `transfer` an array of properties that should be transfered from req.session into the client session so they are accessable on the client. Transferable properties from req.session will override values in req.clientSession. Any transferable properties deleted from req.session will also be deleted from req.clientSession.
* `cookie` session cookie settings, defaulting to `{ path: '/', httpOnly: false, maxAge: null }`

License
-------

  MIT
