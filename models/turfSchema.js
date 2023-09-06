const mongoose = require("mongoose");

const turfSchema = new mongoose.Schema({
  turfName: {
    type: String,
    required: true,
    uppercase: true,
  },
  turfType: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  opening: {
    type: String,
    required: true,
  },
  closing: {
    type: String,
    required: true,
  },
  advance: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  photos: {
    type: Array,
    required: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "turfAdmin",
    required: true,
  },
  isTurfBlocked: {
    type: Boolean,
    default: false,
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const turfModel = mongoose.model("Turf", turfSchema);

module.exports = turfModel;
