const app = require('./app');
const connectDB = require("./src/configs/db");
const authRoutes = require("./src/routes/userRoute.js");
const articleRoutes = require("./src/routes/articleRoute.js");
app.use('/api/user', authRoutes);
app.use('/api/article', articleRoutes);

const PORT = 8000;

connectDB();  // Establish database connection

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
