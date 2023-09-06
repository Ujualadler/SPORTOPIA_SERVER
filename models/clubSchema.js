const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
  clubName: {
    type: String,
    required: true,
    unique: true,
  },
  clubType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
  },
  backgroundImage: {
    type: String,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  users: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      status: {
        type: String,
        enum: ["false", "pending", "accepted"],
        default: "false",
      },
    },
  ],
  gallery: [
    {
      image: {
        type: String,
      },
      content: {
        type: String,
      },
    },
  ],
});

const clubModal = mongoose.model("Club", clubSchema);
module.exports = clubModal;
