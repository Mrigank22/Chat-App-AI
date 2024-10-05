// import {apikey} from"inter-iit-bootcamp-dev-task\server\API.js"
const axios =require('axios');
// import { GoogleGenerativeAI } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();




// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

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

  // const prompt = req.query.prompt;
  // const response = await fetch('https://api.gemini.com/v1/generate', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`, 
  //   },
  //   body: JSON.stringify({
  //     prompt: prompt,
  //   })
  // });
  // // TODO: Stream the response back to the client
  // const data = await response.json();
  // console.log(data)
  // res.json(data);
  // Make sure to include these imports:
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
