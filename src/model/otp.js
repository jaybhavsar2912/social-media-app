const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: [true, "Please Provide Otp"],
  },
  email: {
    type: String,
    required: [true, "Please Provide Email"],
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    require: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 10,
  },
});

module.exports = mongoose.model("Otp", OtpSchema);
