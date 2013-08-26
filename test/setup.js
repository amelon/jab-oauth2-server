/* jshint node:true */

'use strict';

var oauth_server = require('../index')
  , users = require('../default_db_users')
  , tokens = require('../default_db_tokens')
  , passport = require('passport')
  , PORT = 3033
  , express = require('express')
  , app = express()
;
var http = require('http');

var token_uri = 'http://localhost:'+PORT+'/oauth/token';
var no_bearer_uri = 'http://localhost:'+PORT+'/test_no_protect';
var bearer_uri = 'http://localhost:'+PORT+'/test_bearer';

function getHttpServer(done) {
  //create user
  var user = new users(1, 'bob', 'secret');
  user.save();

  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  oauth_server.attach(app, {dbUsers: users, dbTokens: tokens, client_id: 'james', client_secret: '007'});


  app.get('/test_bearer'
  , passport.authenticate('bearer', {session: false})
  , function(req, res) {
      res.json({ user_id: req.user.id, name: req.user.name, scope: req.authInfo.scope });
    }
  );

  app.get('/test_no_protect'
  , function(req, res) {
      res.json({ response: 'ok' });
    }
  );


  var server = http.createServer(app);
  server.listen(PORT, done);

  return server;
}


function btoa(data) {
  return new Buffer(data, 'binary').toString('base64');
}

module.exports = {
  getHttpServer:  getHttpServer
, token_uri:      token_uri
, no_bearer_uri:  no_bearer_uri
, bearer_uri:     bearer_uri
, btoa:           btoa
, tokens:         tokens
};