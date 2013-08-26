/*jshint node:true */
/*global describe, it, before, after */
'use strict';

process.env.NODE_ENV = 'test';
var assert = require('chai').assert
  , request = require('request')
  , setup = require('./setup');

var btoa = setup.btoa;


var slide = require('slide');


function getToken(done) {
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
    done(err, body.access_token);
  });
}

function logout(access_token, done) {
  request({
    uri: setup.token_uri
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
    uri: setup.bearer_uri
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
    this.server = setup.getHttpServer(done);

    this.tokens = setup.tokens;

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