  Fast OAuth2 server installation, used with express

  Using oauth2orize & passport

```js
//server side
var express = require('express');
var app = express();
var oauth_server = require('jab-oauth2-server');

//mimic mongoose db user collection - DO NOT USE ON PRODUCTION
var users = require('jab-oauth2-server/default_db_users');

//fake user creation
new users('id', 'superuser', 'superpassword').save();

//mimic mongoose db token collection - DO NOT USE ON PRODUCTION
var tokens = require('jab-oauth2-server/default_db_tokens');

oauth_server.init({dbUsers: users, dbTokens: tokens, clientId: 'james', clientSecret: '007'});
//could use dbClients
// var clients = require('jab-oauth2-server/default_db_clients');
// new clients('james', '007').save();
// oauth_server.init({dbUsers: users, dbTokens: tokens, dbClients: clients});

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(oauth_server.service);

app.listen(3000);

app.get('/', function(req, res){
  res.send('Hello World');
});

app.listen(3000);
```

```js
//client side - using request

  request({
    uri: 'http://localhost:3000/oauth/token'
  , method: 'POST'
  , headers: {
    'authorization': 'Basic '+ new Buffer('james:007', 'binary').toString('base64')
  }
  , json: true
  , form: {
      username: 'superuser'
    , password: 'superpassword'
    , grant_type: 'password'
    }
  }, function(err, resp, body) {
    // => body: {access_token: 'NNNNNNNNN...', token_type: 'bearer'}
  });

```


```js
//client side - with jQuery

  var bearer_token;

  $.ajax('oauth/token', {
    dataType: 'json'
  , type: 'POST'
  , headers: {
      'authorization': 'Basic '+btoa('james:007')
    }
  , data: {
      username: 'superuser'
    , password: 'superpassword'
    , grant_type: 'password'
    }
  }).done(function(data, textStatus) {
    if (data.token_type == 'bearer' && data.access_token) {
      bearer_token = data.access_token;
    }
    console.log('done data', data, 'textStatus', textStatus);

  }).fail(function(jqXhr, textStatus, errorThrown) {
    console.log('fail textStatus', textStatus, 'errorThrown', errorThrown);
  });

```

## Installation

    $ npm install jab-oauth2-server


## More Information


## Running Tests

To run the test suite first invoke the following command within the repo, installing the development dependencies:

    $ npm install

then run the tests:

    $ grunt test


## License

(The MIT License)

Copyright (c) 2009-2012 A. Mélon &lt;paztaga@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
