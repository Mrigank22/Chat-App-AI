const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Express app
const app = express();

// Database connection
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: 'https://ai-chat-bot-front-end.onrender.com', // Replace with your React app URL
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you're using cookies or authentication
};
app.use(cors(corsOptions));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/chat', require('./routes/chatRoutes'));
app.use('/file', require('./routes/fileRoutes'));
app.use('/user', require('./routes/userRoutes'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
