const mongoose = require("mongoose");
mongoose.set('strictQuery', false);  // Prepares for the default behavior in future releases


// Ensure you replace the below URI with your actual connection string
const URI = "";

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log("DB Connected Successfully ✅");
  } catch (e) {
    console.error("Authentication to database failed ❗", e.message);
    process.exit(1);
  }
};

module.exports = connectDB;
