const bcrypt = require("bcrypt");
const User = require("../model/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const fs = require("fs");
const nodemailer = require("nodemailer");
const Otp = require("../model/otp");

const registerUser = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    const exist = await User.findOne({ email });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "This email already exists",
      });
    }

    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      secure: true,
      auth: {
        user: process.env.GMAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: "Instagram",
      to: email,
      subject: "OTP Verification",
      text: "Your OTP is: " + otp,
    };
    await transporter.sendMail(mailOptions);

    await User.create({ userName, email, password: hashedPassword });

    const loginUser = await User.findOne({ email }).select("-password");

    const alreadyExist = await Otp.findOneAndUpdate(
      { otp: otp, email: email },
      { new: true }
    );
    if (!alreadyExist) {
      await Otp.create({
        otp,
        userId: loginUser._id,
        email,
      });
    }

    return res.status(200).send({
      success: true,
      message: "Otp Send succefully!!!!!",
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.isverify === true) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        const token = jwt.sign(
          {
            id: user._id,
          },
          JWT_SECRET,
          { expiresIn: "2h" }
        );
        const { password, ...userdetails } = user._doc;
        return res.status(200).json({
          token: token,
          message: "Login successfully",
          userdetails,
          success: true,
        });
      } else {
        return res
          .status(400)
          .send({ success: false, message: "Invalid Credentials" });
      }
    } else {
      return res
        .status(400)
        .send({ success: false, message: "please verify your email !!!" });
    }
  } catch (error) {
    next(error);
  }
};

const verifyotp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const loginUser = await Otp.findOne({ email });

    if (loginUser) {
      if (otp === loginUser.otp) {
        await User.findOneAndUpdate({ email }, { isverify: true });
        res.status(200).send({
          message: "OTP verify successfully!",
          success: true,
        });
        await Otp.deleteOne({ email });
      } else {
        return res.status(400).send({
          message: "Invalid OTP!!!",
          success: false,
        });
      }
    } else {
      return res.status(400).send({
        message: "Otp not found or expired!!!",
        success: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    } else {
      const transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        secure: true,
        auth: {
          user: process.env.GMAIL,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: "Instagram",
        to: email,
        subject: "OTP Verification",
        text: "Your OTP is: " + otp,
      };
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          return res.status(500).send({ error, message: "Failed to send OTP" });
        }
      });
      const alreadyExist = await Otp.findOneAndUpdate({
        otp: otp,
        email: email,
      });
      if (!alreadyExist) {
        await Otp.create({
          otp,
          userId: user._id,
          email,
        });
      }
      return res
        .status(200)
        .send({ success: true, message: "Otp Send succefully" });
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password, repeatPassword } = req.body;
    if (password !== repeatPassword) {
      return res
        .status(400)
        .send({ message: "Passwords do not match!", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);
    const otpUser = await Otp.findOne({ email });

    if (otpUser) {
      if (otp === otpUser.otp) {
        const updatePassword = await User.findOneAndUpdate(
          { email },
          { password: newPassword }
        );
        if (updatePassword) {
          await Otp.deleteOne({ email });
          return res
            .status(200)
            .send({ message: "Password has been updated successfuly!!" });
        }
      } else {
        return res
          .status(400)
          .send({ message: "Invalid OTP!!!", success: false });
      }
    } else {
      return res
        .status(400)
        .send({ message: "Otp not found please try again!!!", success: false });
    }
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const query = {
      _id: req.userId,
    };

    const user = await User.findOne(query).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found!" });
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const query = {
      _id: req.userId,
    };
    const user = await User.findOneAndDelete(query);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "someting went wrong!!!" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Prifile Deleted Successfully!!!" });
    }
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    const { gender, country, dateOfBirth, phoneNumber, avtar, userName } =
      req.body;

    const updatedFields = {
      gender,
      country,
      dateOfBirth,
      phoneNumber,
      avtar,
      userName,
    };
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyotp,
  forgetPassword,
  resetPassword,
  getProfile,
  deleteProfile,
};
