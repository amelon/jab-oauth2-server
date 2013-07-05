/*jshint node:true */
'use strict';

var db = []
  , _ = require('lodash');

function DefaultDBUsers(id, username, password) {
	this.id = id;
	this.username = username;
	this.password = password;
}

DefaultDBUsers.prototype = {
	passwordIsOk: function(password) {
		return this.password == password;
	}

, save: function(cb) {
    var item = _.pick(this, function(value) {
      return !_.isFunction(value);
    });
    db.push(item);
    if (cb) { cb(null, item); }
	}
};

DefaultDBUsers.findByUsername = function(username, cb) {
  var res = _.find(db, function(item) {
    return item.username == username;
  });
  if (res) {
    _.extend(res, DefaultDBUsers.prototype);
    return cb(null, res);
  }
  return cb(null, false);
};


DefaultDBUsers.find = function(user_id, cb) {
  var res = _.find(db, function(item) {
    return item.id == user_id;
  });
  if (res) {
    res = _.clone(res);
    _.extend(res, DefaultDBUsers.prototype);
    return cb(null, _.clone(res));
  }
  return cb(null, false);
};


module.exports = DefaultDBUsers;