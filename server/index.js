// import {apikey} from"inter-iit-bootcamp-dev-task\server\API.js"
const axios = require('axios');
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const multer=require("multer");
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("./models/User")
const connectDB=require("./config/db")
const authenticateJWT=require("./middlewares/authMiddleware")
// import { GoogleGenerativeAI } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");


connectDB();
// Initialize Express app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your React app URL
  methods: ['GET', 'POST', 'OPTIONS'], // Include OPTIONS for preflight requests
  allowedHeaders: ['Content-Type', 'Authorization'], // Add any additional headers as needed
  credentials: true, // If you're using cookies or authentication
};

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self' http://localhost:5000; script-src 'self'; style-src 'self';");
  next(); // Proceed to the next middleware or route handler
});

app.use(cors(corsOptions));

app.use(bodyParser.json()); 



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
const fileManager = new GoogleAIFileManager(process.env.REACT_APP_API_KEY);
const modelll = genAI.getGenerativeModel({
  // Choose a Gemini model.
  model: "gemini-1.5-flash",
});
app.post('/upload', upload, async (req, res) => {
  console.log('Request received:', req.file);
  
  // Check if a file was uploaded
  if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
  }
  
  try {
      // Upload the file to the Google AI File Manager
      const filePath = req.file.path;
      const uploadResponse = await fileManager.uploadFile(filePath, {
        mimeType: req.file.mimetype, // Use the uploaded file's mime type
        displayName: req.file.originalname, // Use the original name for display
    });
      console.log(
        `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`,
      ); 

      // Generate content based on the uploaded file
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        { text: "Can you summarize this document as a bulleted list?" },
      ]);
      console.log(result.response.text());

      // Send the successful response back to the client
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


const GenAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
const modell = GenAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/stream', authenticateJWT, async (req, res) => {
  const prompt = req.query.prompt;

  // Validate that prompt is a string
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Invalid prompt. Please provide a non-empty string.' });
  }

 

  try {
    const result = await model.generateContent(prompt);

    

    console.log(result.response.text());
   res.json(result)
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});





app.get('/history', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.chatHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});


//User Authentication 
// POST: Register a new user
app.post('/register', async (req, res) => {
  

  const { username,email, password } = req.body;
  console.log('Request body:', req.body);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully!', token });

  } catch (error) {
    console.error('Registration error:', error); 
    res.status(500).json({ error: 'User registration failed.' });
  }
});

// POST: Login user and return JWT token
app.post('/login', async (req, res) => {
  const { username,email, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(403).json({ error: 'Invalid credentials' });
    
    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});