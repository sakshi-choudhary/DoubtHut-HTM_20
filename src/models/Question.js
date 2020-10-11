const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answers: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
