/*jshint node:true */
'use strict';

var oauth2orize       = require('oauth2orize')
  , passport          = require('passport')

  //@todo: need config settings for crypt_key & sign_key
  , serializer        = require('serializer').createSecureSerializer('crypt_key', 'sign_key')
  , assert            = require('assert')
  , slide             = require('slide');


var BasicStrategy = require('passport-http').BasicStrategy
  , BearerStrategy = require('passport-http-bearer').Strategy;



function isFunction(fn) {
  return typeof fn == 'function';
}


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
  assert(isFunction(DBClients.findByClientId), 'DBClients must implement findByClientId');
  var client = new DBClients();
  assert(isFunction(client.clientSecretIsOk), 'client instance must implement clientSecretIsOk');
}

function checkdbUsers(DBUsers) {
  assert(isFunction(DBUsers.findByUsername), 'DBUsers must implement findByUsername');
  assert(isFunction(DBUsers.find), 'DBUsers must implement find');
  var user = new DBUsers();
  assert(isFunction(user.passwordIsOk), 'user instance must implement passwordIsOk');
}

function checkdbTokens(DBTokens) {
  assert(isFunction(DBTokens.save), 'DBTokens must implement save');
  assert(isFunction(DBTokens.find), 'DBTokens must implement find');
}



/**
 * Module dependencies.
 */
function attach(app, options) {
  options = options || {};
  checkInitOptions(options);

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  authenticateRoute(app);
  logoutRoute(app);

}


server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
  db.users.findByUsername(username, function(err, user) {
    if (err) { return done(err); }
    if (!user || !user.passwordIsOk(password)) { return done(null, false); }

    var token = serializer.stringify([user.id, client.clientId, +new Date(), db.tokens.count()]);
    db.tokens.save(token, user.id, client.clientId, function() {
        done(null, token);
      });
    });
}));



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

    if (client && client.clientSecretIsOk(clientSecret)) {
      return done(null, client);
    }

    return done(null, false);
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
  var chain = slide.chain
    , findToken = db.tokens.find.bind(db.tokens)
    , findUser = db.users.find.bind(db.users);

  chain([
    [findToken, accessToken]
  , [checkToken, chain.last]
  , [findUser, chain.last]
  ], function (err, res) {
    var user;

    if (err) { return done(err); }

    user = res[res.length - 1];
    delete user.password;
    user.access_token = accessToken;

    if (!user) { return done(null, false); }

      // to keep this example simple, restricted scopes are not implemented,
      // and this is just for illustrative purposes
      var info = { scope: '*' };
      done(null, user, info);
  });
}

function checkToken(token, cb) {
  if (!token) { return cb(null, false); }
  cb(null, token.userId);
}



passport.use(new BearerStrategy(bearerStrategyCheck));

/**
 * routes definition
 *
 *
 * /oauth/token to get
 *
 */
function authenticateRoute(app) {
  app.post('/oauth/token',   [
    passport.authenticate('basic', { session: false })
  , server.token()
  , server.errorHandler()
  ]);
}

function logoutRoute(app) {
  app.get('/oauth/logout',
    passport.authenticate('bearer', {session: false})
  , function(req, res) {
      db.tokens.remove(req.user.access_token, function(err) {
        if (err) { return; }
        req.logout();
        res.send(true);
      })
  });
}


module.exports = {
  attach: attach
, passport: passport
};
