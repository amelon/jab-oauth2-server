/*jshint node:true */
/*global describe, it, before, after */
'use strict';

var request = require('request')
  , PORT = 3033;

var token_uri = 'http://localhost:'+PORT+'/oauth/token';
var no_bearer_uri = 'http://localhost:'+PORT+'/test_no_protect';
var bearer_uri = 'http://localhost:'+PORT+'/test_bearer';

function btoa(data) {
  return new Buffer(data, 'binary').toString('base64');
}


function login() {
  request({
    uri: token_uri
  , method: 'POST'
  , headers: {
    'authorization': 'Basic '+btoa('james:007')
  }
  , json: true
  , form: {
      username: 'bob'
    , password: 'secret'
    , grant_type: 'password'
    }
  }, function(err, resp, body) {
    body = body;
    console.log('resp login', {err: err, body:body});
    if (err) return;
    setTimeout(function() {logout(body)}, 1000);
  });
}

function logout(data) {
  console.log('next is logout');
  request({
        uri: token_uri
      , method: 'DELETE'
      , headers: {
          'authorization': 'Bearer ' + data.access_token
        }
      , json: true
      }, function(err, resp, body) {
        console.log('resp logout', {err: err, body:body});
        if (err) return;
        setTimeout(function() {onceAgain(data)})
      });
}

function onceAgain(data) {
  console.log('next is onceAgain');
  request({
    uri: bearer_uri
  , method: 'GET'
  , headers: {
      'authorization': 'Bearer ' + data.access_token
    }
  , json: true
  }, function(err, resp, body) {
    console.log('logout err', err, 'body', body);
  });
}

login();
