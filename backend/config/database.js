require("dotenv").config();
const mysql = require("mysql2/promise");
const mongoose = require("mongoose");

// Kết nối MariaDB
const mariadb = mysql.createPool({
    host: process.env.MARIA_HOST,
    user: process.env.MARIA_USER,
    password: process.env.MARIA_PASS,
    database: process.env.MARIA_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 30000, 
//   socketTimeoutMS: 45000,
// })
//   .then(() => console.log("✅ MongoDB connected successfully"))
//   .catch(err => console.error("❌ MongoDB Connection Error:", err));

mongoose.connect(process.env.MONGO_URI);


const db = mongoose.connection;
db.on("error", err => console.error("🔥 MongoDB Error:", err));
db.on("disconnected", () => console.log("⚠️ MongoDB disconnected!"));

module.exports = { mariadb, mongoose };