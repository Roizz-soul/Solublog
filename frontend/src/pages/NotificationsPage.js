// src/pages/NotificationsPage.js
import React, { useContext, useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications", {
        headers: { "X-Token": userToken },
      });
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  return (
    <div className="notifications-container">
      <h2>Your Notifications</h2>
      {loading ? (
        <p>Loading notifications...</p>
      ) : (
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p>No notifications to display.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
