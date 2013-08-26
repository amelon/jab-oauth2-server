/*jshint node:true */
/*global describe, it, before */

'use strict';
process.env.NODE_ENV = 'test';

var assert      = require('chai').assert
  , FakeDbUser;

describe('Fake DB User', function() {
  before(function() {
    FakeDbUser = require('../default_db_users');
  });

  describe('check static function', function() {
    it('should have findOneById and findOneByUsername', function() {
      assert.isFunction(FakeDbUser.findOneById);
      assert.isFunction(FakeDbUser.findOneByUsername);
    });
  });

  describe('instance', function() {
    before(function() {
      this.db_user = new FakeDbUser(1, 'user', 'pwd');
    });

    it('should have toObject & comparePassword properties', function() {
      assert.isFunction(this.db_user.comparePassword);
      assert.isFunction(this.db_user.toObject);

      this.db_user.save();
    });

    it('should be retrieved', function(done) {
      FakeDbUser.findOneById(1, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done('no user found'); }
        done();
      });
    });

    it('should return false when not retrieved', function(done) {
      FakeDbUser.findOneById(2, function(err, user) {
        if (err) { return done(err); }
        assert.isFalse(user);
        done();
      });
    });


    it('should compare password correctly', function(done) {
      FakeDbUser.findOneById(1, function(err, user) {
        user.comparePassword('pwd', function(err, isMatched) {
          assert(isMatched);
          done();
        });
      });
    });

    it('should compare password correctly', function(done) {
      FakeDbUser.findOneById(1, function(err, user) {

        user.comparePassword('badpwd', function(err, isMatched) {
          assert.isFalse(isMatched);
          done();
        });
      });
    });

  });


});