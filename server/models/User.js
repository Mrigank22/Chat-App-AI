const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  chatHistory: [
    {
      role: String,
      question: String,
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
