const mongoose = require('mongoose');
//.populate('user).populate('dishes) s
const Schema = mongoose.Schema;

var favoritesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dishes:  [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  }]
}, {
  timestamps: true
});

var Favorites = mongoose.model('favorite', favoritesSchema);

module.exports = Favorites;