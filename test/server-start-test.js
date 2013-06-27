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
  , PORT = 3033;

var http = require('http');

var token_uri = 'http://localhost:'+PORT+'/oauth/token';

function btoa(data) {
  return new Buffer(data, 'binary').toString('base64');
}


describe('OAuth Jab server started in express env', function() {
  before(function(done) {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'keyboard cat' }));
    oauth_server.attach(app, {dbUsers: users, dbTokens: tokens, clientId: 'james', clientSecret: '007'});

    this.server = http.createServer(app);
    this.server.listen(PORT, done);

    //create user
    new users(1, 'bob', 'secret').save();

  });

  describe('make bad oauth request (basic)', function() {
    before(function(done) {
      request({
        uri: token_uri
      , method: 'POST'
      }, function(err, req, body) {
        this.body = body;
        done(err);
      }.bind(this));
    });

    it('should be Unauthorized', function() {
      assert.equal(this.body, 'Unauthorized');
    });
  });


  describe('make good oauth request (basic)', function() {
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
    });

    it('should have bearer token_type', function() {
      assert.equal(this.body.token_type, 'bearer');
    });
  });


  describe('make good oauth request (basic) with wrong client info', function() {
    before(function(done) {

      request({
        uri: token_uri
      , method: 'POST'
      , headers: {
        'authorization': 'Basic '+btoa('james:008')
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

    it('should be Unauthorized', function() {
      assert.equal(this.body, 'Unauthorized');
    });
  });


  describe('make good oauth request (basic) with wrong user info', function() {
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
        , password: 'secretss'
        , grant_type: 'password'
        }
      }, function(err, resp, body) {
        this.body = body;
        done(err);
      }.bind(this));

    });

    it('should have error info', function() {
      assert(this.body.error);
      assert.equal(this.body.error, 'invalid_grant');
    });

  });

  describe('make good oauth request (basic) with bad or no grant type ', function() {
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
        , password: 'secrets'
        }
      }, function(err, resp, body) {
        this.body = body;
        done(err);
      }.bind(this));

    });

    it('should have error info', function() {
      assert(this.body.error);
      assert.equal(this.body.error, 'unsupported_grant_type');
    });

  });




  after(function(done) {
    this.server.close(done);
  });

});