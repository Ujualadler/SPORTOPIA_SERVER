const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  turf: { type: mongoose.Schema.Types.ObjectId, ref: "Turf", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  bookedSlots: [{ type: String, required: true }],
  bookedDate: { type: Date, required: true },
  turfAdmin:{ type: mongoose.Schema.Types.ObjectId, ref: "turfAdmin", required: true },
  totalAdvance: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
});

  

const BookingModel = mongoose.model("booking", bookingSchema);

module.exports = BookingModel;
