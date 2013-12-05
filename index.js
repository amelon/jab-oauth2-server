/*jshint node:true */
'use strict';

var oauth2orize       = require('oauth2orize')
  , passport          = require('passport')

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
    if (!options.client_id || !options.client_secret) {
      throw new Error('Jab OAuth2 server options should contain either dbClients option or pair client_id + client_secret options');
    }

    options.dbClients = require('./default_db_clients');

    client = new options.dbClients(options.client_id, options.client_secret);
    client.save();
  }
  db.clients = options.dbClients;
  checkdbClients(db.clients);
}


function checkdbClients(DBClients) {
  assert(isFunction(DBClients.findOneByClientId), 'DBClients must implement findOneByClientId');
  var client = new DBClients();
  assert(isFunction(client.clientSecretCompare), 'client instance must implement clientSecretCompare');
}

function checkdbUsers(DBUsers) {
  assert(isFunction(DBUsers.findOneByUsername), 'DBUsers must implement findOneByUsername');
  assert(isFunction(DBUsers.findOneById), 'DBUsers must implement findOneById');
  var user = new DBUsers();
  assert(isFunction(user.comparePassword), 'user instance must implement comparePassword');
  assert(isFunction(user.toObject), 'user instance must implement toObject');
}

function checkdbTokens(DBTokens) {
  assert(isFunction(DBTokens.createByParams), 'DBTokens must implement save');
  assert(isFunction(DBTokens.findOneByToken), 'DBTokens must implement findOneByToken');
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

function exchangePassword(client, username, password, scope, done) {
  db.users.findOneByUsername(username, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false); }

    user.comparePassword(password, function(err, isMatched) {
      if (err) { return done(err); }
      if (!isMatched) { return done(null, false); }

        // var token = serializer.stringify([user.id, client.client_id, +new Date(), count]);

      db.tokens.createByParams(user.id, client.client_id, function(err, token) {

        if (err) { return done(err); }
        done(null, token.token);

      });
    });
  });
}

server.exchange(oauth2orize.exchange.password(exchangePassword));



/**
 * [basicStrategyCheck description]
 * @param  {String}   clientId      [description]
 * @param  {String}   clientSecret  [description]
 * @param  {Function} done          [description]
 * @return {void}                   [description]
 */
function basicStrategyCheck(clientId, clientSecret, done) {
  db.clients.findOneByClientId(clientId, function(err, client) {
    if (err) { return done(err); }

    if (client && client.clientSecretCompare(clientSecret)) {
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
    , findToken = db.tokens.findOneByToken.bind(db.tokens)
    , findUser = db.users.findOneById.bind(db.users);

  chain([
    [findToken, accessToken]
  , [checkToken, chain.last]
  , [findUser, chain.last]
  ], function (err, res) {
    var user;
    if (err) { return done(err); }
    user = res[res.length - 1];
    if (!user) { return done(null, false); }

    user = user.toObject();
    delete user.password;
    delete user.salt;
    user.access_token = accessToken;


      // to keep this example simple, restricted scopes are not implemented,
      // and this is just for illustrative purposes
      var info = { scope: '*' };
      done(null, user, info);
  });
}

function checkToken(token, cb) {
  if (!token) { return cb(null, false); }
  cb(null, token.user_id);
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
  app.delete('/oauth/token',
    passport.authenticate('bearer', {session: false})
  , function(req, res, next) {
      db.tokens.remove(req.user.access_token, function(err) {
        if (err) { return next(err); }
        req.logout();
        res.send(true);
      });
    }
  , server.errorHandler()
  );
}


module.exports = {
  attach: attach
, passport: passport
};
