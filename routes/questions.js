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

//@route    PATCH /questions/:id
//@desc     Edit the question
router.patch("/:id", ensureAuth, async (req, res) => {
  try {
    let question = await Question.findById(req.params.id).lean();
    if (!question) {
      return res.send("Error, Not Found");
    }

    if (question.userId.toString() !== req.user._id.toString()) {
      res.redirect("/questions");
    } else {
      question.category = req.body.category || question.category;
      question.subject = req.body.subject || question.subject;
      question.question = req.body.question || question.question;

      await Question.findByIdAndUpdate({ _id: req.params.id }, question);
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    GET /questions/:id
//@desc     Display the selected question with answers
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let question = await Question.findById({ _id: req.params.id }).lean();
    if (!question) {
      return res.send("Error, Not Found");
    }
    res.render("questions/showAnswers", {
      question,
      loggedInUser: req.user,
      isEditing: false,
    });
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    PATCH /questions/answers/:id
//@desc     Post an answer for a specific question
router.patch("/answers/:id", ensureAuth, async (req, res) => {
  try {
    let question = await Question.findById({ _id: req.params.id }).lean();
    if (!question) {
      return res.send("Error, Not Found");
    }

    let newAnswer = {
      id: new Date().getTime().toString(),
      content: req.body.answer,
      username: req.user.displayName,
      userId: req.user._id,
    };
    question.answers = [...question.answers, newAnswer];
    // console.log(question);
    await Question.findByIdAndUpdate({ _id: req.params.id }, question);
    res.redirect(`/questions/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    DELETE /questions/delete/:id
//@desc    Delete a question posted by user
router.delete("/delete/:id", ensureAuth, async (req, res) => {
  try {
    let question = await Question.findById(req.params.id).lean();

    if (question.userId.toString() !== req.user._id.toString()) {
      res.redirect("/questions/allQuestions");
    } else {
      await Question.findByIdAndDelete(req.params.id);
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.error(error);
    res.send("Server error");
  }
});

//@route    DELETE /questions/answers/delete/:id
//@desc     Delete an answer posted by user
router.delete("/answers/delete/:id", ensureAuth, async (req, res) => {
  try {
    let questions = await Question.find().lean();
    let answer1 = {},
      question1 = {};
    questions.forEach((question) => {
      question.answers.forEach((answer) => {
        // console.log(answer.id.toString() === req.params.id.toString());
        if (answer.id.toString() === req.params.id.toString()) {
          answer1 = answer;
          question1 = question;
        }
      });
    });

    if (!answer1) {
      res.send("Error, Not Found");
    }

    if (
      answer1.userId.toString() === req.user._id.toString() ||
      question1.userId.toString() === req.user._id.toString()
    ) {
      //Filter the answers which are of not the id of deleting answer
      question1.answers = question1.answers.filter(
        (element) => element.id !== answer1.id
      );
      await Question.findByIdAndUpdate({ _id: question1._id }, question1);
      res.redirect(`/questions/${question1._id}`);
    } else {
      res.redirect(`/questions/${question1._id}`);
    }
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

module.exports = router;
