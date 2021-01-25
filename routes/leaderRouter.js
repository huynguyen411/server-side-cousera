const express = require('express');
const Leaders = require('../models/leaders');
const leaderRouter = express.Router();
var authenticate = require('../authenticate');

leaderRouter.use(express.json());

leaderRouter.route('/')
  .get((req, res, next) => {
    Leaders.find({})
      .then(leaders => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
      }, err => next(err))
      .catch(err => next(err));
  })
  .post([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Leaders.create(req.body);
    Leaders.save()
      .then(leaders => {
        console.log('Leader created', leaders);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
      }, err => next(err))
      .catch(err => next(err));
  })
  .put([authenticate.verifyUser, authenticate.verifyAdmin], (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders');
  })
  .delete([authenticate.verifyUser, authenticate.verifyAdmin], (req, res) => {
    Leaders.deleteMany({})
      .then(leaders => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
      })
  });

leaderRouter.route('/:leaderId')
  .get((req, res, next) => {
    Leaders.findById(req.params.leaderld)
      .then(leader => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      }, err => next(err))
      .catch(err => next(err));
  })

  .post([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/' + req.params.leaderId);
  })

  .put([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Leaders.findByIdAndUpdate(req.params.leaderld, {
      $set: req.query
    }, {
      new: true
    })
      .then(leader => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      }, (err) => next(err))
      .catch(err => next(err));
  })
  
  .delete([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Leaders.deleteOne(req.params.leaderld)
      .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      }, err => next(err))
      .catch(err => next(err));
  });

module.exports = leaderRouter;