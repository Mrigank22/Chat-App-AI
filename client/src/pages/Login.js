// src/components/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css"; // Assuming auth.css exists for styling

const backendUrl = process.env.REACT_APP_BACKEND_URL

function Login() {
  const [username, setUsername] = useState(""); // Changed from email to username
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // For navigation

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle login logic with API
    try {
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Updated to send username
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token); // Save token in local storage
        // Optionally save user details if needed
        // localStorage.setItem('user', JSON.stringify(data.user)); // Save user details
        navigate('/chat'); // Redirect to chat page after successful login
      } else {
        // Handle login errors
        console.error('Login failed:', data.error || 'Unknown error');
        alert(data.error || 'Login failed, please try again.'); // Alert user on error
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed, please try again.'); // Alert user on error
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label> {/* Updated label from Email to Username */}
          <input
            type="text"
            value={username} // Bind to username state
            onChange={(e) => setUsername(e.target.value)} // Update username state
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}

export default Login;
