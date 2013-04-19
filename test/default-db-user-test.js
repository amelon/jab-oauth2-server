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
		it('should have find and findByUsername', function() {
			assert.isFunction(FakeDbUser.find);
			assert.isFunction(FakeDbUser.findByUsername);
		});
	});

	describe('instance', function() {
		before(function() {
			this.db_user = new FakeDbUser(1, 'user', 'pwd');
		});

		it('should have passwordIsOk properties', function() {
			assert.isFunction(this.db_user.passwordIsOk);

			this.db_user.save();
		});

		it('should be retrieved', function(done) {
			FakeDbUser.find(1, function(err, user) {
				if (err) { throw err; }
				if (!user) { return done('no user found'); }
				done();
			});
		});

		it('should return false when not retrieved', function(done) {
			FakeDbUser.find(2, function(err, user) {
				if (err) { throw err; }
				assert.isFalse(user);
				done();
			});
		});


		it('should compare password correctly', function(done) {
			FakeDbUser.find(1, function(err, user) {
				assert(user.passwordIsOk('pwd'));
				assert.isFalse(user.passwordIsOk('badpwd'));
				done();
			});
		});

	});


});