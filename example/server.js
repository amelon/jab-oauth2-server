var oauth_server = require('../index')
  , users = require('../default_db_users')
  , tokens = require('../default_db_tokens')
  , express = require('express')
  , app = express()
  , request = require('request')
  , PORT = 3033
  , passport = require('passport');
var http = require('http');

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
oauth_server.attach(app, {dbUsers: users, dbTokens: tokens, clientId: 'james', clientSecret: '007'});

var server = http.createServer(app);
server.listen(PORT, function() {
  console.log('listen on port '+PORT);
});

//create user
new users(1, 'bob', 'secret').save();

app.get('/test_bearer'
, passport.authenticate('bearer', {session: false})
, function(req, res) {
    res.json({ user_id: req.user.id, name: req.user.name, scope: req.authInfo.scope });
  }
);
