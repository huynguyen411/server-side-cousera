const express = require("express");
const Dishes = require("../models/dishes");
var authenticate = require('../authenticate');
const cors = require('./cors');
const dishRouter = express.Router();

dishRouter.use(express.json());

//---------------------------------dishes end point
dishRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.find({})
      .populate('comments.author')
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, [authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Dishes.create(req.body)
      .then(
        (dish) => {
          console.log("Dish created", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, [authenticate.verifyUser, authenticate.verifyAdmin], (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete(cors.corsWithOptions, [authenticate.verifyUser, authenticate.verifyAdmin], (req, res) => {
    Dishes.deleteMany({})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
      })
      .catch((err) => console.log(err));
  });

//----------------------dishId end point
dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
  })

  .put([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId, {
      $set: req.query,
    }, {
      new: true,
    }
    )
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .delete([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Dishes.deleteOne(req.params.dishId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
      })
      .catch((err) => console.log(err));
  });

//---------------------------------comments end point
dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            err = new Error("Dish" + req.params.dishId + " not found!");
            err.statusCode = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
              .then((dish) => {
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  })
              }, (err) => next(err));
          } else {
            err = new Error("Dish" + req.params.dishId + " not found!");
            err.statusCode = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /dishes/" +
      req.params.dishId +
      "/comments"
    );
  })

  .delete([authenticate.verifyUser, authenticate.verifyAdmin], (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            for (var i = 0; i < dish.comments.length; i++) {
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else {
            err = new Error("Dish" + req.params.dishId + " not found!");
            err.statusCode = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

//------------------------comments/id end point
dishRouter
  .route("/:dishId/comments/commentId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments.id(req.params.commentId));

          } else if (dish == null) {
            err = new Error("Dish" + req.params.dishId + " not found!");
            err.statusCode = 400;
            return next(err);

          } else {
            err = new Error("Comment" + req.params.commentId + " not found!");
            err.statusCode = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /dishes/" +
      req.params.dishId +
      "/comments/" +
      req.params.commentId
    );
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null
            && req.user._id.equals(dish.comments.id(req.params.commentId).author)) {
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null
            && req.user._id.equals(dish.comments.id(req.params.commentId).author)) {

            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );

          } else if (dish == null) {
            err = new Error("Dish" + req.params.dishId + " not found!");
            err.statusCode = 400;
            return next(err);
          } else {
            err = new Error("Comment" + req.params.commentId + " not found!");
            err.statusCode = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;