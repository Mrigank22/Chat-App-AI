const express = require("express");
const router = express.Router();
const { getUserHistory } = require('../controllers/userController');
const authenticateJWT = require('../middlewares/authMiddleware');

router.get("/history", authenticateJWT, getUserHistory);

module.exports = router;
