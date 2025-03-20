const e = require("express");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, },
  phone: { type: String, },
  address: { type: String, },
  avatar: { type: String, default: "" },
  background: { type: String, default: "" },
  gender: { type: Number, default: 0 },
  dob: { type: Date, default: null },
  email: { type: String, required: true, unique: true },
  albums: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  conversations: { type: Array, default: [] },
  bio: { type: String, default: "" }
},{ strict: true, _id: false });

module.exports = mongoose.model("User", UserSchema);