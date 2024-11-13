// src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
//import './Header.css';

const Header = ({ user, logout }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <Link to="/">Solublog</Link>
        </div>
        {user ? (
          <>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/users">Users</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/create-blog">Create Post</Link>
              <Link to="/search">Search</Link>
              <Link to="/notifications">Notifications</Link>
              <button onClick={handleLogout}>Logout</button>
            </nav>
          </>
        ) : (
          <>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/users">Users</Link>
              <Link to="/search">Search</Link>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
