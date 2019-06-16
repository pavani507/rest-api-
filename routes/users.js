const express = require("express");
const router = express.Router();
const User = require("../models").User;
const Sequelize = require("sequelize");
const authenticateUser = require("./auth");
const bcryptjs = require("bcryptjs");

router.get("/", authenticateUser, (req, res) => {
  res.status(200);
  res.json({
    id: req.currentUser.id,
    firstName: req.currentUser.emailAddress,
    lastName: req.currentUser.lastName,
    emailAddress: req.currentUser.emailAddress
  });
});
router.post("/", (req, res, next) => {
  const info = req.body;
  console.log(info.id);
  if (!info.emailAddress) {
    const err = new Error("You have not entered sufficient credentials");
    err.status = 400;
    next(err);
  } else {
    User.findOne({ where: { emailAddress: info.emailAddress } }).then(email => {
      if (email) {
        const err = new Error("That email address is already in use");
        err.status = 400;
        next(err);
      } else {
        info.password = bcryptjs.hashSync(info.password);

        User.create(info)
          .then(() => {
            res.location("/");
            res.status(201).end();
          })
          .catch(err => {
            if (err.name === "SequelizeValidationError") {
              err.message = "All data must be entered";
              err.status = 400;
              next(err);
            } else {
              err.status = 400;
              next(err);
            }
          });
      }
    });
  }
});

module.exports = router;
