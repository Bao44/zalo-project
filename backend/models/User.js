const e = require("express");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  supabaseId: { type: String, required: true, unique: true },  // add
  id: { type: String },
  name: { type: String, },
  phone: { type: String, },
  avatar: { type: String, default: "" },
  gender: { type: Number, default: "" },
  dob: { type: Date, default: null },
  email: { type: String, required: true, unique: true },
  albums: { type: Array, default: [] },
  friends: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  conversations: { type: Array, default: [] },
  bio: { type: String, default: "" }
},{ strict: true });

module.exports = mongoose.model("User", UserSchema);