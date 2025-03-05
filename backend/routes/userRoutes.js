const express = require("express");
const User = require("../models/User"); // Model user trong MongoDB
const router = express.Router();

// API lấy thông tin user theo ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User không tồn tại" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
