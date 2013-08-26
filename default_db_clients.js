/*jshint node:true */
'use strict';

var db;

function DefaultDBClients(client_id, client_secret) {
	this.client_id = client_id;
	this.client_secret = client_secret;
	DefaultDBClients.db = this;
}

DefaultDBClients.prototype = {
	clientSecretCompare: function(client_secret) {
		return this.client_secret == client_secret;
	}

, save: function() {
		db = this;
	}
};

DefaultDBClients.findOneByClientId = function(client_id, cb) {
  var res = db.client_id != client_id ? false : db;
  return cb(null, res);
};


module.exports = DefaultDBClients;