const express = require("express");
const cors = require("cors");
const userRoute = require("./src/routes/userRoute");
const articleRoute = require("./src/routes/articleRoute");
const commentRoute = require("./src/routes/commentRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route handlers
app.use("/api/user", userRoute);
app.use("/api/article", articleRoute);
app.use("/api/comment", commentRoute);

// Catch-all for any other request not handled by the above routes
app.all('*', (req, res) => {
  res.status(404).send('Not found');
});

module.exports = app;
