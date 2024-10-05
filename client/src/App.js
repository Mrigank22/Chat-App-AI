import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Function to submit question to the server
  

  const askQuestion = async () => {
    setLoading(true); // Start the loading state
    try {
      const response = await fetch(`http://localhost:5000/stream?prompt=${question}`, {
        method: 'GET'
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Extract the response text
        const aiResponse = data.response.candidates[0].content.parts[0].text;
  
        // Update the conversation with the user's question and AI's response
        setConversation((prevConversation) => [
          ...prevConversation,
          { role: 'user', content: question },
          { role: 'AI', content: aiResponse }
        ]);
  
        // Scroll to the latest message
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // End the loading state
    }
  };
  

  return (
    <div className="container">
      <h1>Chat with me</h1>

      {/* Chat container */}
      <div className="chat-container">
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'GPT-4'}:</strong>
            <span>{msg.content}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input section */}
      <textarea
        className="textarea"
        rows="4"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <br />
      <button className="button" onClick={askQuestion} disabled={loading}>
        {loading ? 'Loading...' : 'Ask'}
      </button>
    </div>
  );
}

export default App;
