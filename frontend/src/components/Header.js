// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";
//import './Header.css';

const Header = ({ user, logout }) => {
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
              <Link to="/profile">Profile</Link>
              <Link to="/create-blog">Create Post</Link>
              <Link to="/search">Search</Link>
              <Link to="/notifications">Notifications</Link>
              <button onClick={logout}>Logout</button>
            </nav>
          </>
        ) : (
          <nav>
            <Link to="/login">Login</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
