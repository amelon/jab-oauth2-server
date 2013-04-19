/*jshint node:true */
'use strict';

var db;

function DefaultDBUsers(id, username, password) {
	this.id = id;
	this.username = username;
	this.password = password;
}

DefaultDBUsers.prototype = {
	passwordIsOk: function(password) {
		return this.password == password;
	}

, save: function() {
		db = this;
	}
};

DefaultDBUsers.findByUsername = function(username, cb) {
  if (db.username != username) {
    return cb(null, false);
  }
  return cb(null, db);
};


DefaultDBUsers.find = function(user_id, cb) {
  if (db.id != user_id) {
    return cb(null, false);
  }
  return cb(null, db);
};


module.exports = DefaultDBUsers;