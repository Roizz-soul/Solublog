// src/pages/UsersPage.js
import React, { useEffect, useState } from "react";
import api from "../services/api";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  return (
    <div className="users-page-container">
      <h2>All Users</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="users-list">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="user-card">
                <h3>{user.full_name}</h3>
                <p>
                  <strong>Username:</strong> {user.user_name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Location:</strong> {user.location || "Not provided"}
                </p>
                <p>
                  <strong>Skills:</strong> {user.skills || "Not listed"}
                </p>
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
