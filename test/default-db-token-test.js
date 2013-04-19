/*jshint node:true */
/*global describe, it, before */

'use strict';

var assert      = require('chai').assert
  , DefaultDbTokens;


describe('Default DB Token', function() {
  before(function() {
    DefaultDbTokens = require('../default_db_tokens');
  });

  describe('static functions', function() {
    it('should have find & save', function() {
      assert.isFunction(DefaultDbTokens.find);
      assert.isFunction(DefaultDbTokens.save);
    });
  });

  describe('populate with 3 tokens', function() {
    before(function() {
      DefaultDbTokens.save(1, 'user_id', 'client_id');
      DefaultDbTokens.save(2, 'user_id2', 'client_id2');
      DefaultDbTokens.save(3, 'user_id3', 'client_id3');
    });

    it('should have 3 tokens', function() {
      assert.equal(DefaultDbTokens.count(), 3);
    });

    it('should retrieve token 1', function(done) {
      DefaultDbTokens.find(1, function(err, token) {
        if (err) { return done(err); }
        assert(token);
        done();
      });
    });

    it('should return false when not retrieved', function(done) {
      DefaultDbTokens.find(4, function(err, token) {
        if (err) { return done(err); }
        assert.isFalse(token);
        done();
      });
    });


  });


});