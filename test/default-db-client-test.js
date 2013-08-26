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
		it('should have findOneByClientId', function() {
			assert.isFunction(DefaultDbClients.findOneByClientId);
		});
	});

	describe('instance', function() {
		before(function() {
			this.db_client = new DefaultDbClients(1, 'clientSecret');
		});

		it('should have client_id, client_secret, save, clientSecretCompare properties', function() {
			var db_client = this.db_client;

			assert.property(db_client, 'client_id');
			assert.property(db_client, 'client_secret');
			assert.isFunction(db_client.save);
			assert.isFunction(db_client.clientSecretCompare);

			db_client.save();
		});

		it('return false when not retrieved', function(done) {
			DefaultDbClients.findOneByClientId(2, function(err, client) {
				if (err) { throw err; }
				assert.isFalse(client);
				done();
			});
		});

		describe('when retrieved', function() {
			before(function(done) {
				DefaultDbClients.findOneByClientId(1, function(err, client) {
					if (err) { return done(err); }
					this.client = client;
					assert(client);
					done();
				}.bind(this));
			});

			it('should return client instance', function() {
				var client = this.client;
				assert.property(client, 'client_id');
				assert.property(client, 'client_secret');
				assert.isFunction(client.clientSecretCompare);
			});

			it('should compare clientSecret correctly', function() {
				assert(this.client.clientSecretCompare('clientSecret'));
				assert.isFalse(this.client.clientSecretCompare('badSecret'));
			});

		});




	});


});