const User =require("../models/User")
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.stream = async (req, res) => {
  const prompt = req.query.prompt;

  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Invalid prompt. Please provide a non-empty string.' });
  }

  try {
    const result = await model.generateContent(prompt);
    const user = await User.findById(req.user.id);
    if(user){
      user.chatHistory.push({
        role : String(user.username),
        question : String(prompt),
        content : String(result.response.candidates[0].content.parts[0].text),
        timestamp: new Date()
      })
      await user.save()
    }
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.chat = async (req, res) => {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Say this is a test" }],
      model: "gemini-1.5-flash",
    });
    console.log(chatCompletion);
  } catch (error) {
    console.error("Chat Error: ", error);
    res.status(500).json({ error: "Chat error occurred" });
  }
};
