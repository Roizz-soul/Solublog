// src/pages/LoginPage.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/"); // Redirect to HomePage after successful login
    } catch (error) {
      setError("Login failed. Please check your credentials.");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password"); // Redirect to forgot password page
  };

  return (
    <div className="login-container">
      <h2>Login to Solublog</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <div>
        <button onClick={handleForgotPassword}>Forgot Password?</button>
      </div>
    </div>
  );
};

export default LoginPage;
