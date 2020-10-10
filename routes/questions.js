const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const Question = require("../models/Question");

//@route    GET /questions/post
//@desc    Render the form to post a question
router.get("/post", ensureAuth, async (req, res) => {
  res.render("questions/postQuestions");
});

//@route    GET /questions
//@desc    Display all the questions
router.get("/", ensureAuth, async (req, res) => {
  try {
    let allQuestions = await Question.find().lean();
    res.render("questions/allQuestions", { allQuestions });
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    POST /questions
//@desc     Post a question
router.post("/", ensureAuth, async (req, res) => {
  try {
    let userId = req.user._id;
    let username = req.user.displayName;
    let { category, subject, question } = req.body;
    let newQuestion = { userId, username, category, subject, question };

    await Question.create(newQuestion);
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    GET /questions/edit/:id
//@desc     Render the form to edit the question
router.get("/edit/:id", ensureAuth, async (req, res) => {
    try {
      let question = await Question.findById(req.params.id).lean();
      if (!question) {
        return res.send("Error, Not Found");
      }
  
      if (question.userId.toString() !== req.user._id.toString()) {
        res.redirect("/questions");
      } else {
        res.render("questions/editQuestion", { question });
      }
    } catch (error) {
      console.error(error);
      res.send("Server Error");
    }
  });

module.exports = router;
