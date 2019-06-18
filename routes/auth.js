const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const User = require("../models").User;

module.exports = (req, res, next) => {
  let message = null;

  const credentials = auth(req);

  if (credentials) {
    User.findOne({ where: { emailAddress: credentials.name } }).then(user => {
      if (user) {
        const authenticated = bcryptjs.compareSync(
          credentials.pass,
          user.password
        );
        if (authenticated) {
          req.currentUser = user;
          next();
        } else {
          res.status(401);
          message = "Wrong password, try again";
          res.json({ message: message });
        }
      } else {
        message = "Email does not exits";
        res.status(401);
        res.json({ message: message });
      }
    });
  } else {
    res.status(401);
    message = "Please provide login credentials";
    res.json({ message: message });
  }
};
