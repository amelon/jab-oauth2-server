/*jshint node:true */
'use strict';

var db = []
  , _ = require('lodash');

function DefaultDBUsers(id, username, password) {
	this.id = id;
	this.username = username;
	this.password = password;
}

DefaultDBUsers.prototype.comparePassword = function(candidatePassword, cb) {
	cb(null, this.password == candidatePassword);
};

DefaultDBUsers.prototype.toObject =  function() {
  return _.clone(this);
};

DefaultDBUsers.prototype.isActive =  function() {
  return this.active
};

DefaultDBUsers.prototype.save = function(cb) {
  db.push(this);
  if (cb) { cb(null, this); }
};

DefaultDBUsers.prototype.passwordIsOk = DefaultDBUsers.prototype.comparePassword;

DefaultDBUsers.findOneByUsername = function(username, cb) {
  var res = _.find(db, function(item) {
    return item.username == username;
  });
  if (res) {
    return cb(null, res);
  }
  return cb(null, false);
};


DefaultDBUsers.findOneById = function(user_id, cb) {
  var res = _.find(db, function(item) {
    return item.id == user_id;
  });
  if (res) {
    return cb(null, res);
  }
  return cb(null, false);
};


module.exports = DefaultDBUsers;
