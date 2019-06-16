"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const Sequelize = require("sequelize");
const models = require("./models").sequelize;
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var path = require("path");

const db = new Sequelize({
  dialect: "sqlite",
  storage: "./fsjstd-restapi.db"
});

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// setup morgan which gives us http request logging
app.use(morgan("dev"));
db.authenticate()
  .then(() => {
    console.log("database connected");
  })
  .catch(err => console.error("connection failed"));

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!"
  });
});

app.use("/api", require("./routes/index"));
app.use("/api/users", require("./routes/users"));
app.use("/api/courses", require("./routes/courses"));

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// set our port
const port = process.env.PORT || 5000;

// start listening on our port
models.sync({ force: false, logging: false }).then(() => {
  app.listen(port, () => {
    console.log(`Express server is listening on port ${port}`);
  });
});

module.exports = app;
