const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Name cannot exceed 30 charaters"],
    minLength: [4, "Name should have more then 4 charaters"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password should be greater then 8 charaters"],
  },
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  phoneNumber: {
    type: Number,
  },
  avtar: {
    type: String,
  },
  isverify: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("users", userSchema);
