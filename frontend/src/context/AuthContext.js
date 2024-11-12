// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(
    localStorage.getItem("userToken") || null
  );

  // Fetch user details if token exists
  useEffect(() => {
    if (userToken && !user) {
      fetchUserData(userToken);
    }
  }, [userToken]);

  const fetchUserData = async (token) => {
    try {
      const response = await api.get("/users/me", {
        headers: { "X-Token": token },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout(); // Clear token if fetching user data fails
    }
  };

  const login = async (email, password) => {
    try {
      const authHeader = "Basic " + btoa(`${email}:${password}`);
      const response = await api.get("/connect", {
        headers: { Authorization: authHeader },
      });

      const token = response.data.token;
      setUserToken(token);
      localStorage.setItem("userToken", token); // Store token in local storage

      fetchUserData(token); // Fetch user data with the new token
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const logout = async () => {
    try {
      await api.get("/disconnect", {
        headers: { "X-Token": userToken },
      });
      setUser(null);
      setUserToken(null);
      localStorage.removeItem("userToken"); // Clear token from local storage
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
