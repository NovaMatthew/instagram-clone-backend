const connectDB = require('/Users/matt/Documents/Spring24/SER330QA/FinalProject/instagram-clone-backend/src/configs/db.js'); 

connectDB().then(() => {
    console.log("Database connection has been verified.");
    process.exit(0);
}).catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
});
