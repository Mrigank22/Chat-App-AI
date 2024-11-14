import React, { useState, useEffect, useRef } from 'react';
import '../styles/App.css';
import MarkdownRenderer from '../utils/MarkdownRenderer';
import { FiPaperclip } from "react-icons/fi";
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
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > FILE_SIZE_LIMIT) {
      alert('File size exceeds 5MB limit.');
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current.click();
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to view history.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/user/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch history');
  
      const history = await response.json();
  
      const formattedHistory = history.map(item => ({
        role: item.role, // Ensure each item has a role like "user" or "AI"
        content: item.content, // Ensure each item has content (message body)
      }));
  
      setConversation(prev => [...formattedHistory, ...prev]);
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
    console.log(formData)
    try {
      const response = await fetch(`${backendUrl}/file/upload`, {
        method: 'POST',
        body: formData,
      });
      console.log(response)
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();
      setConversation((prevConversation) => [
        ...prevConversation,
        { role: 'user', content: `File uploaded: ${file.name}` },
        { role: 'AI', content: result.generatedText },
      ]);
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to ask a question.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/chat/stream?prompt=${encodeURIComponent(question)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const data = await response.json();
      const aiResponse = data.response.candidates[0].content.parts[0].text;

      setConversation((prevConversation) => [
        ...prevConversation,
        { role: 'user', content: question },
        { role: 'AI', content: aiResponse }
      ]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('askQuestion error:', error.message);
      alert('An error occurred while asking the question: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Chat with me</h1>
      <div className="chat-container">
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'GPT-4'}:</strong>
            {/* Render Markdown only for GPT responses */}
            <MarkdownRenderer content={msg.content} />
            {msg.role === 'AI' && (
              <CopyToClipboard text={msg.content}>
                <IoCopyOutline className="copy-icon" title="Copy entire response" />
              </CopyToClipboard>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
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
        ref={fileInputRef}
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
      <button className="button" onClick={askQuestion} disabled={loading}>
        {loading ? 'Loading...' : 'Ask'}
      </button>
    </div>
  );
  
}

export default Appli;
