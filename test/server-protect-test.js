/*jshint node:true */
/*global describe, it, before, after */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert
  , request = require('request')
  , setup = require('./setup');

var btoa = setup.btoa;


describe('OAuth Jab server protect ressources', function() {
  before(function(done) {
    this.server = setup.getHttpServer(done);
  });


  describe('get access_token', function() {
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
      this.access_token = this.body.access_token;
    });
  });


  describe('access protected ressources with token', function() {
    before(function(done) {
      request({
        uri: setup.bearer_uri
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
        uri: setup.bearer_uri
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
        uri: setup.no_bearer_uri
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