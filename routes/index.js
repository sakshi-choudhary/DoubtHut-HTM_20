const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("./../middleware/auth");

const Question = require("../models/Question");
const Article = require("../models/Article");

//@router     GET /index
//@desc       Welcome Homepage
router.get("/", ensureGuest, (req, res) => {
  res.render("homepage");
});

//@router     GET /dashboard
//@desc       Open Dashboard when succesfully logged In
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const questions = await Question.find();
    const question = questions.filter(
      (element) => element.userId.toString() === req.user._id.toString()
    );
    let answers = [];
    questions.forEach((question) => {
      question.answers.forEach((element) => {
        if (element.userId.toString() === req.user._id.toString()) {
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
    const articles = await Article.find({ userId: req.user._id });
    // console.log(articles);

    res.render("dashboard", {
      name: req.user.displayName,
      image: req.user.image,
      userId: req.user._id,
      category: req.user.category,
      questions: question,
      answers,
      bookmarks: req.user.bookmarks,
      articles,
    });
  } catch (error) {
    console.error(error);
    res.send("Server error");
  }
});

module.exports = router;
