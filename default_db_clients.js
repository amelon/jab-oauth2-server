/*jshint node:true */
'use strict';

var db;

function DefaultDBClients(client_id, client_secret) {
	this.clientId = client_id;
	this.clientSecret = client_secret;
	DefaultDBClients.db = this;
}

DefaultDBClients.prototype = {
	clientSecretIsOk: function(client_secret) {
		return this.clientSecret == client_secret;
	}

, save: function() {
		db = this;
	}
};

DefaultDBClients.findByClientId = function(client_id, cb) {
  var res = db.clientId != client_id ? false : db;
  return cb(null, res);
};


module.exports = DefaultDBClients;