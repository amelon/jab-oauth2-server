/*jshint node:true */
/*global describe, it, before */

'use strict';
process.env.NODE_ENV = 'test';

var assert      = require('chai').assert
	, DefaultDbClients;

describe('Default DB Clients', function() {
	before(function() {
		DefaultDbClients = require('../default_db_clients');
	});

	describe('check static function', function() {
		it('should have findByClientId', function() {
			assert.isFunction(DefaultDbClients.findByClientId);
		});
	});

	describe('instance', function() {
		before(function() {
			this.db_client = new DefaultDbClients(1, 'clientSecret');
		});

		it('should have clientId, clientSecret, save, clientSecretIsOk properties', function() {
			var db_client = this.db_client;

			assert.property(db_client, 'clientId');
			assert.property(db_client, 'clientSecret');
			assert.isFunction(db_client.save);
			assert.isFunction(db_client.clientSecretIsOk);

			db_client.save();
		});

		it('return false when not retrieved', function(done) {
			DefaultDbClients.findByClientId(2, function(err, client) {
				if (err) { throw err; }
				assert.isFalse(client);
				done();
			});
		});

		describe('when retrieved', function() {
			before(function(done) {
				DefaultDbClients.findByClientId(1, function(err, client) {
					if (err) { return done(err); }
					this.client = client;
					assert(client);
					done();
				}.bind(this));
			});

			it('should return client instance', function() {
				var client = this.client;
				assert.property(client, 'clientId');
				assert.property(client, 'clientSecret');
				assert.isFunction(client.clientSecretIsOk);
			});

			it('should compare clientSecret correctly', function() {
				assert(this.client.clientSecretIsOk('clientSecret'));
				assert.isFalse(this.client.clientSecretIsOk('badSecret'));
			});

		});




	});


});