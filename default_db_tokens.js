/*jshint node:true */
'use strict';

var db = []
  , _ = require('lodash');

function DefaultDBTokens(id, user_id, client_id) {
  this.id       = id;
  this.userId   = user_id;
  this.clientId = client_id;
}

DefaultDBTokens.prototype = {
  save: function(cb) {
    var item = _.pick(this, function(value) {
      return !_.isFunction(value);
    });
    db.push(item);
    if (cb) { cb(null, item); }
  }
};



DefaultDBTokens.find = function(token, cb) {
  var res = _.find(db, function(item) {
    return item.id == token;
  });
  if (res) { return cb(null, res); }
  return cb(null, false);
};

DefaultDBTokens.count = function() {
  return db.length;
};

DefaultDBTokens.save = function(token, user_id, client_id, cb) {
  var item = new DefaultDBTokens(token, user_id, client_id);
  item.save(cb);
};

DefaultDBTokens.remove = function(token, cb) {
  this.find(token, function(err, res) {
    cb(err, res);
  });
};


module.exports = DefaultDBTokens;