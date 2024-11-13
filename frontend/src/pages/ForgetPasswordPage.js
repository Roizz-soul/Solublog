import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .post("/request-password-reset", { email })
      .then((response) => {
        setMessage("Password reset link sent to your email.");
        setTimeout(() => {
          navigate("/login"); // Redirect to login page after successful reset request
        }, 3000);
      })
      .catch((err) => {
        setError("Email not found or invalid.");
      });
  };

  return (
    <div className="forgot-password-page">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Enter your email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Reset Link</button>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
