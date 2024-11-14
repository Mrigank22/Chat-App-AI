const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");


const fileManager = new GoogleAIFileManager(process.env.REACT_APP_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const UPLOAD_DIR = './uploads/';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


exports.upload = async (req, res) => {
  console.log(req)
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: req.file.mimetype,
      displayName: req.file.originalname,
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: "Can you summarize this document as a bulleted list?" },
    ]);
    res.status(200).json({
      msg: 'File uploaded successfully',
      filename: req.file.filename,
      generatedText: result.response.text(),
    });
  } catch (error) {
    console.error('Error uploading file to Gemini AI:', error);
    res.status(500).json({ msg: 'Error uploading file to Gemini AI', error: error.message });
  }
};
