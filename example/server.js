var oauth_server = require('../index')
  , users        = require('../default_db_users')
  , tokens       = require('../default_db_tokens')
  , express      = require('express')
  , app          = express()
  , request      = require('request')
  , PORT         = 3033
  , passport     = require('passport');
var http         = require('http');
var bodyParser   = require('body-parser');

// app.use(express.cookieParser());
//
// parse request bodies (req.body)
app.use( bodyParser.urlencoded({ extended: true }) );
// parse application/json
app.use(bodyParser.json());

// app.use(express.session({ secret: 'keyboard cat' }));
oauth_server.attach(app, {dbUsers: users, dbTokens: tokens, client_id: 'james', client_secret: '007'});

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
}

function logErrors(err, req, res, next) {
  console.log(err.stack);
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

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
