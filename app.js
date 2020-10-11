const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const app = express();

//*****CONFIGURATION
//dotenv
dotenv.config({ path: "./config/config.env" });

//database
connectDB();

//passport
require("./config/passport.js")(passport);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(
  methodOverride((req, res) => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//Session
app.use(
  session({
    secret: process.env.PORT || '7781' ,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//Passport
app.use(passport.initialize());
app.use(passport.session());

//EJS
app.set("view engine", "ejs");

//Routes
app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/index"));
app.use("/questions", require("./routes/questions"));
app.use("/users", require("./routes/users"));
app.use("/articles", require("./routes/articles"));

//Static
app.use(express.static("public"));

//*****PORT
app.listen(process.env.PORT || 7781, () => {
  console.log("Server Connected");
});
