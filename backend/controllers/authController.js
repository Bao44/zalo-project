const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { mariadb } = require("../config/database");

// Đăng ký user
const register = async (req, res) => {
  const { email, password, name, phone, avatar } = req.body;

  try {
    // Mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user trong MongoDB trước
    const userMongo = new User({ email, password, name, phone, avatar });
    userMongo.password = hashedPassword;
    const savedUser = await userMongo.save();
    const mongoId = savedUser._id.toString();

    // Lưu user vào MariaDB, dùng `_id` từ MongoDB làm `userId`
    // await mariadb.query(
    //   "INSERT INTO user (userId, email, password, name, phone, avatar) VALUES (?, ?, ?, ?, ?, ?)",
    //   [mongoId, email, hashedPassword, name, phone, avatar]
    // );

    res.status(201).json({ message: "User registered successfully", userId: mongoId });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ error: "Email already exists or DB error" });
  }
};

// Đăng nhập
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { register, login };
