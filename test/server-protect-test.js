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
  , passport = require('passport');

var http = require('http');

var token_uri = 'http://localhost:'+PORT+'/oauth/token';
var no_bearer_uri = 'http://localhost:'+PORT+'/test_no_protect';
var bearer_uri = 'http://localhost:'+PORT+'/test_bearer';

function btoa(data) {
  return new Buffer(data, 'binary').toString('base64');
}


describe('OAuth Jab server protect ressources', function() {
  before(function(done) {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'keyboard cat' }));
    oauth_server.attach(app, {dbUsers: users, dbTokens: tokens, clientId: 'james', clientSecret: '007'});

    this.server = http.createServer(app);
    this.server.listen(PORT, done);

    //create user
    new users(1, 'bob', 'secret').save();

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


  });


  describe('get access_token', function() {
    before(function(done) {

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
        this.body = body;
        done(err);
      }.bind(this));
    });


    it('should have access_token', function() {
      assert(this.body.access_token);
      this.access_token = this.body.access_token;
    });
  });


  describe('access protected ressources with token', function() {
    before(function(done) {
      request({
        uri: bearer_uri
      , method: 'GET'
      , headers: {
          'authorization': 'Bearer ' + this.access_token
        }
      , json: true
      }, function(err, resp, body) {
        this.body = body;
        done(err);
      }.bind(this));
    });

    it('should have expected response', function() {
      assert(this.body.user_id);
    });

  });


  describe('access protected ressources with no or bad token', function() {
    before(function(done) {
      request({
        uri: bearer_uri
      , method: 'GET'
      , headers: {
          'authorization': 'Bearer xx' + this.access_token
        }
      , json: true
      }, function(err, resp, body) {
        this.body = body;
        done(err);
      }.bind(this));
    });

    it('should be Unauthorized', function() {
      assert.equal(this.body, 'Unauthorized');
    });

  });


  describe('access not protected ressources', function() {
    before(function(done) {
      request({
        uri: no_bearer_uri
      , method: 'GET'
      , json: true
      }, function(err, resp, body) {
        this.body = body;
        done(err);
      }.bind(this));
    });

    it('should have expected response', function() {
      assert.equal(this.body.response, 'ok');
    });

  });


  after(function(done) {
    this.server.close(done);
  });

});