/*jshint node:true */
/*global describe, it, before, after */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert
  , oauth_server = require('../index')
  , users = require('../default_db_users')
  , tokens = require('../default_db_tokens')
  , express = require('express')
  , app = express()
  , request = require('request')
  , PORT = 3033
  , passport = require('passport')
  , _ = require('lodash');

var slide = require('slide');
var http = require('http');

var token_uri = 'http://localhost:'+PORT+'/oauth/token';
var bearer_uri = 'http://localhost:'+PORT+'/test_bearer';

function btoa(data) {
  return new Buffer(data, 'binary').toString('base64');
}


function getToken(done) {
  request({
    uri: token_uri
  , method: 'POST'
  , headers: {
    'authorization': 'Basic '+btoa('james:007')
  }
  , json: true
  , form: {
      username: 'bob'
    , password: 'secret'
    , grant_type: 'password'
    }
  }, function(err, resp, body) {
    done(err, body.access_token);
  });
}

function logout(access_token, done) {
  request({
    uri: token_uri
  , method: 'DELETE'
  , headers: {
      'authorization': 'Bearer ' + access_token
    }
  , json: true
  }, function(err, resp, body) {
    done(err, access_token);
  });
}

function protectAccess(access_token, done) {
  request({
    uri: bearer_uri
  , method: 'GET'
  , headers: {
      'authorization': 'Bearer ' + access_token
    }
  , json: true
  }, function(err, resp, body) {
    done(err, body);
  });
}


describe('OAuth Jab server protect ressources', function() {
  before(function(done) {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'keyboard cat' }));
    oauth_server.attach(app, {dbUsers: users, dbTokens: tokens, clientId: 'james', clientSecret: '007'});

    app.get('/test_bearer'
    , passport.authenticate('bearer', {session: false})
    , function(req, res) {
        res.json({ user_id: req.user.id, name: req.user.name, scope: req.authInfo.scope });
      }
    );

    this.tokens = tokens;

    this.server = http.createServer(app);
    this.server.listen(PORT, done);

    //create user
    new users(1, 'bob', 'secret').save();

  });


  describe('get access_token + logout + access protected ressources', function() {
    before(function(done) {
      var self = this;
      var chain = slide.chain;

      chain([
        [getToken]
      , [logout, chain.last]
      , [protectAccess, chain.last]
      ], function (err, res) {
        self.res = res[res.length - 1];
        done(err);
      });
    });


    it('should have Unauthorized body response', function() {
      assert.equal(this.res, 'Unauthorized');
    });
  });

  after(function(done) {
    this.server.close(done);
  });

});