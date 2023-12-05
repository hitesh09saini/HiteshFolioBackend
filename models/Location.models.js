const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: String,
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
  },
});

locationSchema.index({ coordinates: '2dsphere' });
const Location = mongoose.model('Location', locationSchema);
module.exports = Location;
