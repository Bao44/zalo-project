const mongoose = require("mongoose");

const FriendshipSchema = new mongoose.Schema({
    sender_id: {
        type: String,
        ref: "User",
        required: true
    },
    receiver_id: {
        type: String,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        default: "pending"
    },
    content:{
        type: String,
        required: false
    },
    type: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Friendship", FriendshipSchema);
