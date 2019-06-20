const express = require("express");
const router = express.Router();
const Course = require("../models").Course;
const User = require("../models").User;
const authenticateUser = require("./auth");

router.get("/", (req, res) => {
  Course.findAll({
    attributes: [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  })
    .then(courses => {
      res.status(200);
      res.json({ courses });
    })
    .catch(err => {
      console.error(err);
    });
});

router.get("/:id", (req, res, next) => {
  Course.findOne({
    where: {
      id: req.params.id
    },
    attributes: [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  })
    .then(course => {
      if (course) {
        res.status(200);
        res.json({ course });
      } else {
        res.json({ error: "course not found" });
      }
    })
    .catch(err => {
      next(err);
    });
});

router.post("/", authenticateUser, (req, res, next) => {
  const info = req.body;

  if (!info.title) {
    const err = new Error("You have not entered a title for your course");
    err.status = 400;
    next(err);
  } else {
    Course.findOne({
      where: {
        title: info.title
      }
    }).then(title => {
      if (title) {
        const err = new Error("This course already exists");
        err.status = 400;
        next(err);
      } else {
        info.userId = req.currentUser.id;

        Course.create(info)
          .then(course => {
            res.location("/api/courses/" + course.id);
            res.status(201).end();
          })
          .catch(err => {
            if (err.name === "SequelizeValidationError") {
              err.message = err.message;
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

router.put("/:id", authenticateUser, (req, res, next) => {
  const id = req.params.id;
  const info = req.body;

  if (!info.title || !info.description || !info.userId) {
    const err = new Error("Need minimum required data ");
    err.status = 400;
    next(err);
  }

  Course.findOne({
    where: {
      id: id
    }
  })
    .then(course => {
      if (course.userId !== req.currentUser.id) {
        const err = new Error("You can only edit your own course");
        err.status = 403;
        next(err);
      } else if (course) {
        return course.update(req.body);
      } else {
        const err = new Error("We can not find course belongs to that ID");
        err.status = 400;
        next(err);
      }
    })
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      if (err.name === "SequelizeValidationError") {
        err.message = err.message;
        err.status = 400;
        next(err);
      } else {
        err.status = 400;
        next(err);
      }
    });
});

router.delete("/:id", authenticateUser, (req, res, next) => {
  const id = req.params.id;
  Course.findOne({
    where: {
      id: id
    }
  })
    .then(course => {
      if (course.userId !== req.currentUser.id) {
        const err = new Error("Delete your course");
        err.status = 403;
        next(err);
      } else if (course) {
        course.destroy();
        res.status(204).end();
      } else {
        const err = new Error("We can not find course belongs to that ID");
        err.status = 400;
        next(err);
      }
    })
    .catch(err => {
      if (err.name === "SequelizeValidationError") {
        err.message = err.message;
        err.status = 400;
        next(err);
      } else {
        err.status = 400;
        next(err);
      }
    });
});

module.exports = router;
