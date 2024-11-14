const express = require("express");
const router = express.Router();
const { upload } = require('../controllers/fileController');
const multer = require('multer')
const uploadfile = multer({dest : 'uploads/'})

router.post("/upload",uploadfile.single('file'), upload);

module.exports = router;
