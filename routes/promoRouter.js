const express = require('express');
const Promotions = require('../models/promotions');
var authenticate = require('../authenticate');

const promoRouter = express.Router();

promoRouter.use(express.json());

promoRouter.route('/')
  .get((req, res, next) => {
    Promotions.find({})
      .then(promotions => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
      }, err => next(err))
      .catch(err => next(err));
  })
  .post([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Promotions.create(req.body);
    Promotions.save()
      .then(promotions => {
        console.log('Promotion created', promotions);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
      }, err => next(err))
      .catch(err => next(err));
  })
  .put([authenticate.verifyUser, authenticate.verifyAdmin], (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
  })
  .delete([authenticate.verifyUser, authenticate.verifyAdmin], (req, res) => {
    Promotions.deleteMany({})
      .then(promotions => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
      })
  });

promoRouter.route('/:promold')
  .get((req, res, next) => {
    Promotions.findById(req.params.promold)
      .then(promo => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      }, err => next(err))
      .catch(err => next(err));
  })

  .post([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/' + req.params.promold);
  })
  .put([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promold, {
      $set: req.query
    }, {
      new: true
    })
      .then(promo => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      }, (err) => next(err))
      .catch(err => next(err));
  })
  .delete([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Promotions.deleteOne(req.params.promold)
      .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      }, err => next(err))
      .catch(err => next(err));
  });

module.exports = promoRouter;