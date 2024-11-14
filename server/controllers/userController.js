const User= require("../models/User")

exports.getUserHistory =async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      res.json(user.chatHistory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
  }