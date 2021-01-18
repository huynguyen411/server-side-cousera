const express = require('express');
const Promotions = require('../models/promotions');

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
  .post((req, res, next) => {
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
  .put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
  })
  .delete((req, res) => {
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

  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/' + req.params.promold);
  })
  .put((req, res, next) => {
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
  .delete((req, res, next) => {
    Promotions.deleteOne(req.params.promold)
      .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      }, err => next(err))
      .catch(err => next(err));
  });

module.exports = promoRouter;