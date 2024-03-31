const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    comments: String,
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    date: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // Corrected line
        ref: "User"
    }
});

module.exports = mongoose.model("Review", reviewSchema);
