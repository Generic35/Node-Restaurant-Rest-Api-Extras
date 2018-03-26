const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorites');
const favoritesRouter = express.Router();
const authenticate = require('../authenticate');

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
  .get((req, res, next) => {
    Favorites.find({})
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user.id }, (err, favorites) => {
      if (err) {
        return next(err)
      }
      else if (favorites) {
        req.body.favoriteDishIds.forEach(dishId => {
          favorites.dishes.push(dishId);
        });

        favorites.save().then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }, (err) => next(err))
      }
      else {
        Favorites.create({
          user: req.user.id,
          dishes: req.body.favoriteDishIds
        })
          .then((favorites) => {
            console.log('favorites Created ', favorites);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
          }, (err) => next(err))
          .catch((err) => next(err));
      }
    });
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user.id })
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

favoritesRouter.route('/:dishId')
  .get((req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/dishId');
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user.id }, (err, favorites) => {
      if (err) {
        return next(err);
      }
      else if (favorites) {
        favorites.dishes.push(req.params.dishId);
        favorites.save().then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }, (err) => {
          console.warn(err);
          next(err)
        })
      }
      else {
        Favorites.create({
          user: req.user.id,
          dishes: [req.params.dishId]
        })
          .then((favorites) => {
            console.log('favorite Created ', favorites);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
          }, (err) => next(err))
          .catch((err) => next(err));
      }
    });
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.end('PUT operation not supported on /favorites');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user.id })
      .populate('dishes')
      .then((favorites) => {
        if (favorites) {
          let favoriteDishToRemove = favorites.dishes.find((dish)=>{
            return dish.id === req.params.dishId
          });
          
        let index = favorites.dishes.indexOf(favoriteDishToRemove);
        favorites.dishes.splice(index, 1)
        favorites.save().then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }, (err) => next(err))
      }
    })
  });

module.exports = favoritesRouter;