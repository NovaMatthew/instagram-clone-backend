const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String, maxlength: 500 },
});

module.exports = mongoose.model("Comment", CommentSchema);
