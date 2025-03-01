import dotenv from "dotenv";
import mongoose from "mongoose";

// 加载环境变量
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

let connection;

export const connectDB = async () => {
  try {
    if (connection) {
      return connection;
    }

    const db = process.env.MONGO_URL;
    connection = await mongoose.connect(db, {
      dbName: process.env.NODE_ENV === "test" ? "testdb" : "test",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // 更安全的连接验证方式
    const dbConnection = mongoose.connection;
    console.log(`MongoDB Connected to database: ${dbConnection.name}`);
    return connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (connection) {
    await mongoose.disconnect();
    connection = null;
  }
};
