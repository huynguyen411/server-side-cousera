const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
var FileStore = require('session-file-store')(session);
const mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter');

const url = config.mongoUrl;
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

connect.then(() => {
  console.log('Connecting to Server');
})
  .catch(err => console.log(err));

var app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321'));

// app.use(session({
//   name: 'session-id',
//   secret: '12345-67890-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   store: new FileStore()
// }));

app.use(passport.initialize());
// app.use(passport.session());

function auth(req, res, next) {

  if (!req.session) {
    var authHeader = req.headers.authorization;

    if (!authHeader) {
      var err = new Error('You are not authenticated');
      err.status = 403;
      return next(err);
    //   var err = new Error('You are not authenticated');
    //   res.setHeader('WWW-Authenticate', 'Basic');
    //   err.status = 401;
    //   return next(err);
    // }
    // var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    // var username = auth[0];
    // var password = auth[1];

    // if (username === 'admin' && password === 'password') {
    //   req.session.user = 'admin';
    //   next(); //authorized
    // } else {
    //   var err = new Error('You are not authenticated');
    //   res.setHeader('WWW-Authenticate', 'Basic');
    //   err.status = 401;
    //   return next(err);
    }
  } else {
    next(err);
    // if (req.session.user === 'admin') {
    //   next();
    // } else {
    //   var err = new Error('You are not authenticated');
    //   err.status = 401;
    //   return next(err);
    // }
  }

}

// app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
