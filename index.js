/*jshint node:true */
'use strict';

var oauth2orize       = require('oauth2orize')
  , passport          = require('passport')

  //@todo: need config settings for crypt_key & sign_key
  , serializer        = require('serializer').createSecureSerializer('crypt_key', 'sign_key')
  , _                 = require('lodash')
  , assert            = require('assert')
  , express           = require('express')
  , app               = express();

// create OAuth 2.0 server
var server = oauth2orize.createServer()
  , db = {
      users: null
    , tokens: null
    , clients: null
    };


function checkInitOptions(options) {
  var client;

  if (!options.dbUsers) { throw new Error('Jab OAuth2 server options should contain dbUsers option!'); }
  if (!options.dbTokens) { throw new Error('Jab OAuth2 server options should contain dbTokens option!'); }

  db.users = options.dbUsers;
  checkdbUsers(db.users);

  db.tokens = options.dbTokens;
  checkdbTokens(db.tokens);

  if (!options.dbClients) {
    if (!options.clientId || !options.clientSecret) {
      throw new Error('Jab OAuth2 server options should contain either dbClients option or pair clientId + clientSecret options');
    }

    options.dbClients = require('./default_db_clients');

    client = new options.dbClients(options.clientId, options.clientSecret);
    client.save();
  }
  db.clients = options.dbClients;
  checkdbClients(db.clients);
}


function checkdbClients(DBClients) {
  assert(_.isFunction(DBClients.findByClientId), 'DBClients must implement findByClientId');
  var client = new DBClients();
  assert(_.isFunction(client.clientSecretIsOk), 'client instance must implement clientSecretIsOk');
}

function checkdbUsers(DBUsers) {
  assert(_.isFunction(DBUsers.findByUsername), 'DBUsers must implement findByUsername');
  assert(_.isFunction(DBUsers.find), 'DBUsers must implement find');
  var user = new DBUsers();
  assert(_.isFunction(user.passwordIsOk), 'user instance must implement passwordIsOk');
}

function checkdbTokens(DBTokens) {
  assert(_.isFunction(DBTokens.save), 'DBTokens must implement save');
  assert(_.isFunction(DBTokens.find), 'DBTokens must implement find');
}


function initialize(options) {
  options = options || {};
  checkInitOptions(options);
}


server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
	db.users.findByUsername(username, function(err, user) {
    if (err) { return done(err); }
    if (!user || !user.passwordIsOk(password)) { return done(null, false); }

		var token = serializer.stringify([user.id, client.clientId, +new Date()]);
		db.tokens.save(token, user.id, client.clientId, function() {
			done(null, token);
		});
	});
}));



/**
 * Module dependencies.
 */
// var express = require('express');


// Express configuration

// var app = express();
// app.use(express.favicon(__dirname + '/public/images/icon/favicon.ico'));
// app.set('view engine', 'ejs');
// app.use(express.logger());
// app.use(express.cookieParser());
// app.use(express.bodyParser());
// app.use(express.session({ secret: 'keyboard cat' }));

// app.use(passport.initialize());
// app.use(passport.session());
//
// app.use(app.router);
// app.use(express.static('public', {maxAge: 24 * 60 * 60 * 1000}));
// app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

var BasicStrategy = require('passport-http').BasicStrategy
  , BearerStrategy = require('passport-http-bearer').Strategy;


/**
 * [basicStrategyCheck description]
 * @param  {String}   clientId      [description]
 * @param  {String}   clientSecret  [description]
 * @param  {Function} done          [description]
 * @return {void}                   [description]
 */
function basicStrategyCheck(clientId, clientSecret, done) {
  db.clients.findByClientId(clientId, function(err, client) {
    if (err) {
      return done(err);
    }

    if (!client || !client.clientSecretIsOk(clientSecret)) {
      return done(null, false);
    }

    return done(null, client);
  });
}

passport.use(new BasicStrategy(basicStrategyCheck));



/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */

function bearerStrategyCheck(accessToken, done) {
  db.tokens.find(accessToken, function(err, token) {
    if (err) {
      return done(err);
    }

    if (!token) {
      return done(null, false);
    }

    db.users.find(token.userId, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      // to keep this example simple, restricted scopes are not implemented,
      // and this is just for illustrative purposes
      var info = { scope: '*' };
      done(null, user, info);
    });
  });
}

passport.use(new BearerStrategy(bearerStrategyCheck));

/**
 * routes definition
 *
 *
 * /oauth/token to get
 *
 */
app.post('/oauth/token',   [
  passport.authenticate('basic', { session: false })
, server.token()
, server.errorHandler()
]);

// app.get('/test_bearer',
// passport.authenticate('bearer', {session: false})
// , function(req, res) {
//     // req.authInfo is set using the `info` argument supplied by
//     // `BearerStrategy`.  It is typically used to indicate scope of the token,
//     // and used in access control checks.  For illustrative purposes, this
//     // example simply returns the scope in the response.
//     res.json({ user_id: req.user.id, name: req.user.name, scope: req.authInfo.scope })
//   }
// );

// app.listen(3000);

module.exports = {
  init: initialize
, service: app
};
