const express = require("express");
const router = express.Router();

const authController = require('../controllers/authController');

router.post('/signup', authController.signUp);
router.post('/signin', authController.signInWithMobile);
router.post('/signinweb', authController.signInWithWeb);
router.post('/logOut', authController.logOut);

module.exports = router;
