const express = require("express");
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const ConnectDB = require('./db/connection');
const handleError = require('./middleware/errorHandler');
const notFoundMiddleware = require('./middleware/not-fuound');
const authRoutes = require('./router/user')

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/v1", authRoutes);

app.use(handleError);
app.use(notFoundMiddleware);

app.listen(port, () => {
    ConnectDB()
    console.log(`Server is running at port:${port}`);
  });