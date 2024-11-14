// src/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const goToSignup = () => {
    navigate('/signup');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="content">
        <h1 className="welcome-text">Welcome to Our App!</h1>
        <p className="description">
          A feature rich AI chat app! Please login or signup to get started.
        </p>
        <div className="button-container">
          <button className="signup-button" onClick={goToSignup}>Sign Up</button>
          <button className="login-button" onClick={goToLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
