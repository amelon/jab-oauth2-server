/*jshint node:true */
'use strict';

var db         = []
  , _          = require('lodash')
  , serializer = require('serializer').createSecureSerializer('crypt_key', 'sign_key');


function DefaultDBTokens(token, user_id, client_id) {
  this.token    = token;
  this.user_id   = user_id;
  this.client_id = client_id;
}

DefaultDBTokens.prototype = {
  save: function(cb) {
    var item = _.pick(this, function(value) {
      return !_.isFunction(value);
    });
    db.push(item);
    process.nextTick(function() {
      if (cb) { cb(null, item); }
    });
  }
};



DefaultDBTokens.findOneByToken = function(token, cb) {
  var res = _.find(db, {token: token});

  process.nextTick(function() {
    if (res) { return cb(null, res); }
    return cb(null, false);
  });
};

DefaultDBTokens.count = function(cb) {
  process.nextTick(function() {
    cb(null, db.length);
  });
};


DefaultDBTokens.createByParams = function(user_id, client_id, cb) {
  this.count(function(err, count) {
    var token = serializer.stringify([user_id, client_id, +new Date(), count]);

    var item = new DefaultDBTokens(token, user_id, client_id);
    process.nextTick(function() {
      item.save(cb);
    });
  });
};

DefaultDBTokens.remove = function(token, cb) {
  db = _.reject(db, {token: token});
  process.nextTick(function() {
    cb(null, true);
  });
};

DefaultDBTokens.list = function() {
  return db;
};


module.exports = DefaultDBTokens;