// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Appli from "./Appli"; // Assuming Appli.js is in components folder

function App() {
  const isAuthenticated = localStorage.getItem('token'); // Simple token check
  
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect to signup on first visit */}
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {/* Protect chat page, redirect to login if not authenticated */}
          <Route path="/chat" element={isAuthenticated ? <Appli /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
