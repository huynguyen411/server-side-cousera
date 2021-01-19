var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');

router.use(express.json());

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: err });
      } else {
        // User.create({
        //   username: req.body.username,
        //   password: req.body.password
        // })
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Succesful!' });
        });
      }
    })
  // .then(user => {
  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'application/json');
  //   res.json({ status: 'Registration Succesful!', user: user });
  // }, err => next(err))
  // .catch(err => next(err));
});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged!' })
  // if (!req.session.user) {
  //   var authHeader = req.headers.authorization;

  //   if (!authHeader) {
  //     var err = new Error('You are not authenticated');
  //     res.setHeader('WWW-Authenticate', 'Basic');
  //     err.status = 401;
  //     return next(err);
  //   }

  //   var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  //   var username = auth[0];
  //   var password = auth[1];

  //   User.findOne({ username: username })
  //     .then(user => {
  //       if (user == null) {
  //         var err = new Error('Your password is incorrect!');
  //         err.status = 403;
  //         return next(err);

  //       } else if (user.password != password) {
  //         var err = new Error('Your password is incorrect!');
  //         err.status = 403;
  //         return next(err);

  //       } else if (user.name === username && user.password === password) {
  //         req.session.user = 'authenticated';
  //         res.statusCode = 200;
  //         res.setHeader('Content-Type', 'text/plain');
  //         res.end('You are authenticated!');
  //       }
  //     })
  //     .catch(err => next(err));
  // } else {
  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'text/plain');
  //   res.end('You are already authenticated!');
  // }
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy(); //remove session
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not loged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
