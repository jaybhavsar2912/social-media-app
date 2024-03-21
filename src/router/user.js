const express = require("express");
const routers = express.Router();
const userController = require("../controller/userController");
const { isAuthenticated } = require("../middleware/auth");

routers.post("/sign_up", userController.registerUser);
routers.post("/login", userController.loginUser);
routers.post("/verify_otp", userController.verifyotp);
routers.post("/forget_password", userController.forgetPassword);
routers.post("/reset_password", userController.resetPassword);
routers.get("/user_profile", isAuthenticated, userController.getProfile);
routers.delete("/delete_profile", isAuthenticated, userController.deleteProfile);

module.exports = routers;
