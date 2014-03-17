/*jshint node:true */
/*global describe, it, before, after */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert
  , request = require('request')
  , setup = require('./setup');

var btoa = setup.btoa;

describe('OAuth Jab server started in express env', function() {
  before(function(done) {
    this.server = setup.getHttpServer(done);
  });

  describe('make bad oauth request (basic)', function() {
    before(function(done) {
      request({
        uri: setup.token_uri
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
        uri: setup.token_uri
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
      assert.equal(this.body.token_type, 'Bearer');
    });
  });


  describe('make good oauth request (basic) with wrong client info', function() {
    before(function(done) {

      request({
        uri: setup.token_uri
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
        uri: setup.token_uri
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
        uri: setup.token_uri
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