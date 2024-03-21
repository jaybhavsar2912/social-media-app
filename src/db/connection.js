const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
require("dotenv").config();
const URL = process.env.MongoURL;

const ConnectDB = () => {
  mongoose
    .connect(URL)
    .then(() => console.log("Database Connected Successfully!!!"))
    .catch((err) => {
      console.log("somthing went wrong", err);
    });
};

module.exports = ConnectDB;
