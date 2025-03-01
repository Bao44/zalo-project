const express = require("express");
const { create1vs1, getUserConversations, getConversation } = require("../controllers/conversationController");
const router = express.Router();

router.post("/create1vs1", create1vs1);
router.get("/:userId", getUserConversations);
router.get("/conversationId/:conversationId", getConversation);

module.exports = router;