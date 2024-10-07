import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import MarkdownRenderer from './MarkdownRenderer';
import { FiPaperclip } from "react-icons/fi";
import { jwtDecode } from 'jwt-decode';
import { IoCopyOutline } from "react-icons/io5";
import { CopyToClipboard } from 'react-copy-to-clipboard';

function Appli() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [file, setFile] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';



  const FILE_SIZE_LIMIT = 20 * 1024 * 1024; // 5MB size limit

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




  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to view history.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
  
      const history = await response.json();
      setConversation(history);  // Assuming history is an array of previous conversations
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
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
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found'); // Handle case where no token is found
        alert('You must be logged in to ask a question.');
        setLoading(false);
        return; // Stop execution if no token is found
    }

    try {
        const response = await fetch(`${backendUrl}/stream?prompt=${encodeURIComponent(question)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token here
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

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
    } catch (error) {
        console.error('askQuestion error:', error.message);
        alert('An error occurred while asking the question: ' + error.message); // Display alert to the user
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
            {msg.role === 'AI' && (
              <CopyToClipboard text={msg.content}>
                <IoCopyOutline className="copy-icon" title="Copy to clipboard" />
              </CopyToClipboard>
            )}
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
      
      <button className="button" onClick={fetchHistory} disabled={loading}>
        {loading ? 'Fetching' : 'History'}
      </button>
      <br />
      <button className="button" onClick={askQuestion} disabled={loading}>
        {loading ? 'Loading...' : 'Ask'}
      </button>
    </div>
  );
}

export default Appli;
