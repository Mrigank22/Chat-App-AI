import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import MarkdownRenderer from './MarkdownRenderer';
import { FiPaperclip } from "react-icons/fi";

function App() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [file, setFile] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';



  const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB size limit

  const fileInputRef = useRef(null); // Create a ref to trigger the file input when paperclip is clicked

  // Function to handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Check file size
    if (selectedFile && selectedFile.size > FILE_SIZE_LIMIT) {
      alert('File size exceeds 5MB limit.');
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  // Trigger file input on paperclip icon click
  const handlePaperclipClick = () => {
    fileInputRef.current.click(); // Simulate click on file input
  };

  const uploadFile = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    setLoading(true);
  
    try {
      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
        // headers: {
        //   'Accept': 'application/json', // Ensure the response is parsed as JSON
        // },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
  
      // Update the conversation with the file upload response
      setConversation((prevConversation) => [
        ...prevConversation,
        { role: 'user', content: `File uploaded: ${file.name}` },
        { role: 'AI', content: result.generatedText }, // Include generated text in the conversation
      ]);
  
      // Clear file input after successful upload
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };
  
  



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
            <MarkdownRenderer content={msg.content} />
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

      <FiPaperclip className="paperclip-icon" onClick={handlePaperclipClick} />
      <input
        type="file"
        ref={fileInputRef} // Hidden file input
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {file && <p>Selected file: {file.name}</p>}

      <button className="button" onClick={uploadFile} disabled={loading || !file}>
        {loading ? 'Uploading...' : 'Upload File'}
      </button>

      <br />
      <button className="button" onClick={askQuestion} disabled={loading}>
        {loading ? 'Loading...' : 'Ask'}
      </button>
    </div>
  );
}

export default App;
