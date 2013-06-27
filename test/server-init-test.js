/*jshint node:true */
/*global describe, it, before */
'use strict';
process.env.NODE_ENV = 'test';

var assert = require('chai').assert;

var oauth_server = require('../index')
  , express = require('express')
  , app = express()
  , dbUsers
  , dbClients
  , dbTokens;

describe('Jab oauth server', function() {
  before(function() {
    dbUsers   = require('../default_db_users');
    dbClients = require('../default_db_clients');
    dbTokens  = require('../default_db_tokens');
  });

  describe('init', function() {
    it('should throw errors with bad options', function() {
      assert.throw( function() { oauth_server.attach(app, {dbUsers: '', dbTokens: '', dbClients: ''}); });
		});


    it('should init with dbUsers, dbTokens, dbClients', function() {
      assert.doesNotThrow(function() { oauth_server.attach(app, {dbUsers: dbUsers, dbTokens: dbTokens, dbClients: dbClients}); });
    });

    it('should init with dbUsers, dbTokens, clientId + clientSecret', function() {
      assert.doesNotThrow(function() { oauth_server.attach(app, {dbUsers: dbUsers, dbTokens: dbTokens, clientId: 1, clientSecret: '007'}); });
    });

	});
});