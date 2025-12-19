const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/stocksync";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected to database: stocksync");
    console.log("MongoDB URI:", mongoURI);
  } catch (error) {
    console.error("Error connecting to DB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
