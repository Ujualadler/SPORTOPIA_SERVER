const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({

    turf: { type: mongoose.Schema.Types.ObjectId, ref: "Turf", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    description: {
        type: String,
        required: [true, "Review Description is required"],
        // minlength: [10, "Review Description must be 10 characters or longer"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"]
    }
}, {timestamps: true});

const reviewModel=mongoose.model("Review", ReviewSchema);

module.exports = reviewModel;