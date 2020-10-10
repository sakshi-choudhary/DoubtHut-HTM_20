const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const Article = require("../models/Article");

//@route    GET /articles
//@desc     Show all articles
router.get("/", ensureAuth, async (req, res) => {
  try {
    const articles = await Article.find().lean();
    res.render("articles/allArticles", { articles });
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    GET /articles/post
//@desc     Render the form to post an article
router.get("/post", ensureAuth, async (req, res) => {
  res.render("articles/postArticle");
});

//@route    GET /articles/:id
//@desc     Show selected article
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let article = await Article.findById(req.params.id).lean();
    if (!article) {
      res.send("Error, Not Found");
    }
    res.render("articles/showArticle", {
      article,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});

//@route    POST /articles
//@desc     Post an article
router.post("/", ensureAuth, async (req, res) => {
  try {
    let userId = req.user._id;
    let username = req.user.displayName;
    let { category, subject, question, answer } = req.body;
    let newArticle = { userId, username, category, subject, question, answer };

    await Article.create(newArticle);
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.send("Server Error");
  }
});


//@route    GET /articles/edit/:id
//@desc     Render a from to edit an article
router.get("/edit/:id", ensureAuth, async (req, res) => {
    try {
      let article = await Article.findById(req.params.id).lean();
      if (!article) {
        return res.send("Error, Not Found");
      }
  
      if (article.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/dashboard");
      } else {
        res.render("articles/editArticle", { article });
      }
    } catch (error) {
      console.error(error);
      res.send("Server Error");
    }
  });
  
  //@route    PATCH /articles/:id
  //@desc     Editing an article
  router.patch("/:id", ensureAuth, async (req, res) => {
    try {
      let article = await Article.findById(req.params.id).lean();
      if (!article) {
        return res.send("Error, Not Found");
      }
  
      if (article.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      } else {
        article.category = req.body.category || article.category;
        article.subject = req.body.subject || article.subject;
        article.question = req.body.question || article.question;
        article.answer = req.body.answer || article.answer;
  
        await Article.findByIdAndUpdate({ _id: req.params.id }, article);
        res.redirect("/dashboard");
      }
    } catch (error) {
      console.error(error);
      res.send("Server Error");
    }
  });
  

module.exports = router;
