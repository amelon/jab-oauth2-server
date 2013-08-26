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
    before(function() {
      DefaultDbTokens.createByParams(1, 'user_id', 'client_id');
      DefaultDbTokens.createByParams(2, 'user_id2', 'client_id2');
      DefaultDbTokens.createByParams(3, 'user_id3', 'client_id3');
    });

    it('should have 3 tokens', function() {
      assert.equal(DefaultDbTokens.count(), 3);
    });

    it('should retrieve token 1', function(done) {
      DefaultDbTokens.findOneByToken(1, function(err, token) {
        if (err) { return done(err); }
        assert(token);
        done();
      });
    });

    it('should return false when not retrieved', function(done) {
      DefaultDbTokens.findOneByToken(4, function(err, token) {
        if (err) { return done(err); }
        assert.isFalse(token);
        done();
      });
    });

    it('should drop token', function(done) {
      DefaultDbTokens.remove(1, function(err, res) {
        assert.equal(DefaultDbTokens.count(), 2);
        done();
      });
    });
  });


});