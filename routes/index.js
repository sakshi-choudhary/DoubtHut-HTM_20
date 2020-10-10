const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("./../middleware/auth");

//@router     GET /index
//@desc       Welcome Homepage
router.get("/", ensureGuest, (req, res) => {
  res.render("homepage");
});

//@router     GET /dashboard
//@desc       Open Dashboard when succesfully logged In
router.get("/dashboard", ensureAuth, async (req, res) => {
  res.render("dashboard");
});
module.exports = router;
