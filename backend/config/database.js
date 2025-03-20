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

mongoose.connect(process.env.MONGO_URI);


const db = mongoose.connection;
db.on("error", err => console.error("🔥 MongoDB Error:", err));
db.on("disconnected", () => console.log("⚠️ MongoDB disconnected!"));

module.exports = { mariadb, mongoose };