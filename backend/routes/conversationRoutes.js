const express = require("express");
const { create1vs1, getUserConversations } = require("../controllers/conversationController");
const router = express.Router();

router.post("/create1vs1", create1vs1);
router.get("/:userId", getUserConversations);

module.exports = router;