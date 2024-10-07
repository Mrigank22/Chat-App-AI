// import {apikey} from"inter-iit-bootcamp-dev-task\server\API.js"
const axios =require('axios');
const cors = require("cors");
// import { GoogleGenerativeAI } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const express = require("express");
const bodyParser = require("body-parser");

const multer=require("multer");
const fs = require('fs');
require("dotenv").config();


// Initialize Express app
const app = express();
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your React app URL
  methods: ['GET', 'POST', 'OPTIONS'], // Include OPTIONS for preflight requests
  allowedHeaders: ['Content-Type', 'Authorization'], // Add any additional headers as needed
  credentials: true, // If you're using cookies or authentication
};

app.use(cors(corsOptions));




app.use(bodyParser.json());

app.post("/login",async (req,res) => {

})



const UPLOAD_DIR = './uploads/';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// // Set up multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// // Initialize multer with a 5MB file size limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('file');


const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// console.log(req);
// const uploadResponse = await fileManager.uploadFile("media/gemini.pdf", {
//   mimeType: "application/pdf",
//   displayName: "Gemini 1.5 PDF",
// });

// console.log(
//   `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`,
// );

// const result = await model.generateContent([
//   {
//     fileData: {
//       mimeType: uploadResponse.file.mimeType,
//       fileUri: uploadResponse.file.uri,
//     },
//   },
//   { text: "Can you summarize this document as a bulleted list?" },
// ]);

// // Output the generated text to the console
// console.log(result.response.text());

// File upload route
app.post('/upload', upload, async (req, res) => { // use multer middleware here
  console.log('Request received:', req.file);
  console.log(req.file); 
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  try {
    const uploadResponse = await fileManager.uploadFile(`${UPLOAD_DIR}${req.file.filename}`, {
      mimeType: req.file.mimetype,
      displayName: req.file.filename,
    });

    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

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
  } catch (uploadError) {
    console.error('Error uploading file to Gemini AI:', uploadError);
    res.status(500).json({ msg: 'Error uploading file to Gemini AI', error: uploadError.message });
  }
});






// POST endpoint to handle chat
app.post("/chat", async (req, res) => {

  
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Say this is a test" }],
    model: "gemini-1.5-flash",
});
  console.log(chatCompletion);
  // TODO: Implement the chat functionality
});


// GET endpoint to handle chat
app.get("/stream", async (req, res) => {

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prom = req.query.prompt;
  console.log(prom);
  const result = await model.generateContent(prom);
  console.log(result.response.text());
  res.json(result)
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});