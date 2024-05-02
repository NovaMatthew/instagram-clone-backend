const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,   // Correct property for minimum length
    maxlength: 15,  // Correct property for maximum length
    unique: true,
  },
    email: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
    unique: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please fill a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,   // Correct property for minimum length
  },
  description: {
    type: String,
    maxlength: 50,  // Correct property for maximum length
    default: "",
  },
  profilePicture: {
    type: String,
    default: "YOUR_DEFAULT_AVATAR_URL",
  },
  followers: {
    type: Array,
    default: [],
  },
  followings: {
    type: Array,
    default: [],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    required: true,
    default: "user",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  jwtToken: {
    type: String,
  },
});

module.exports = mongoose.model("User", UserSchema);
