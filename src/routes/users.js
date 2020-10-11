const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const User = require("../models/Users");
const Question = require("../models/Question");
const Article = require("../models/Article");

//@route  GET  /users/settings/:id
//@desc   Render the user profile settings page
router.get("/settings/:id", ensureAuth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString()) {
      return res.redirect("/dashboard");
    }

    let user = await User.findById(req.params.id);
    // console.log(user);
    res.render("user/profileSettings", {
      name: user.displayName,
      userId: user._id,
      image: user.image,
      category: user.category,
    });
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    PATCH users/settings/:id
//@desc     Update the user profile
router.patch("/settings/:id", ensureAuth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString()) {
      return res.redirect("/dashboard");
    }

    let user = await User.findById(req.params.id);
    user.category = req.body.category;

    await User.findByIdAndUpdate({ _id: user._id }, user);
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    GET users/:id
//@desc     Show show user's profile
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id.toString()) {
      return res.redirect("/dashboard");
    }
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.send("Error, Not Found");
    }

    const questions = await Question.find();
    const question = questions.filter(
      (element) => element.userId.toString() === user._id.toString()
    );

    let answers = [];

    questions.forEach((question) => {
      question.answers.forEach((element) => {
        if (element.userId.toString() === user._id.toString()) {
          let answer = {
            question: question.question,
            username: question.username,
            userId: question.userId,
            category: question.category,
            subject: question.subject,
            answer: element.content,
            id: element.id,
          };
          answers = [...answers, answer];
        }
      });
    });
    const articles = await Article.find({ userId: req.params.id });
    // console.log(articles);

    res.render("user/userProfile", {
      user,
      questions: question,
      answers,
      articles,
    });
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    PATCH users/bookmarks/add/:id
//@desc     Add bookmark of answers
router.patch("/bookmarks/add/:id", ensureAuth, async (req, res) => {
  try {
    const questions = await Question.find();

    let user = await User.findById(req.user._id);

    let bookmark = user.bookmarks.filter(
      (bookmark) => bookmark.id.toString() === req.params.id.toLowerCase()
    );

    if (bookmark.length) {
      return res.redirect("/dashboard");
    }

    questions.forEach((question) => {
      question.answers.forEach((element) => {
        if (element.id.toString() === req.params.id.toString()) {
          let newBookmark = {
            question: question.question,
            questionId: question._id,
            answer: element.content,
            QUsername: question.username,
            QUserId: question.userId,
            AUsername: element.username,
            AUserId: element.userId,
            category: question.category,
            subject: question.subject,
            id: element.id,
          };
          user.bookmarks = [...user.bookmarks, newBookmark];
        }
      });
    });
    // console.log(user.bookmarks);

    await User.findByIdAndUpdate({ _id: req.user._id }, user);
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    PATCH users/bookmarks/delete/:id
//@desc     Delete bookmark of answers
router.patch("/bookmarks/delete/:id", ensureAuth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);

    user.bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.id.toString() !== req.params.id.toString()
    );
    await User.findByIdAndUpdate({ _id: req.user.id }, user);
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

module.exports = router;
