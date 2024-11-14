const express = require("express");
const router = express.Router();
const { stream, chat } = require('../controllers/chatController');
const authenticateJWT = require('../middlewares/authMiddleware')

router.get("/stream",authenticateJWT, stream);
router.post("/chat", chat);

module.exports = router;
