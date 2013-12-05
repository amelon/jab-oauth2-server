/*jshint node:true */
/*global describe, it, before */

'use strict';
process.env.NODE_ENV = 'test';

var assert      = require('chai').assert
  , DefaultDbTokens;


describe('Default DB Token', function() {
  before(function() {
    DefaultDbTokens = require('../default_db_tokens');
  });

  describe('static functions', function() {
    it('should have findOneByToken & createByParams', function() {
      assert.isFunction(DefaultDbTokens.findOneByToken);
      assert.isFunction(DefaultDbTokens.createByParams);
    });
  });

  describe('populate with 3 tokens', function() {
    before(function(done) {
      var _this = this;

      DefaultDbTokens.createByParams('user_id', 'client_id', function(err, item) {
        DefaultDbTokens.createByParams('user_id2', 'client_id2', function(err, item) {
          DefaultDbTokens.createByParams('user_id3', 'client_id3', function(err, item) {
            _this.token = item.token;
            done(err);
          });
        });

      });
    });

    it('should have 3 tokens', function(done) {
      DefaultDbTokens.count(function(err, count) {
        console.log('nb tokens', count);
        assert.equal(count, 3);
        done();
      });
    });

    it('should retrieve token 1', function(done) {
      DefaultDbTokens.findOneByToken(this.token, function(err, token) {
        if (err) { return done(err); }
        assert(token);
        done();
      });
    });

    it('should return false when not retrieved', function(done) {
      DefaultDbTokens.findOneByToken('unknow_token', function(err, token) {
        if (err) { return done(err); }
        assert.isFalse(token);
        done();
      });
    });

    it('should drop token', function(done) {
      DefaultDbTokens.remove(this.token, function(err, res) {
        DefaultDbTokens.count(function(err, count) {
          assert.equal(count, 2);
          done();
        });
      });
    });
  });


});