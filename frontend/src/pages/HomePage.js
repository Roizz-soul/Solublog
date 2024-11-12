// src/pages/HomePage.js
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
//import BlogList from "../components/BlogList";
import api from "../services/api";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const HomePage = () => {
  const { user, userToken, logout } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all posts when the component mounts
    const fetchPosts = async () => {
      try {
        const response = await api.get("/blogs");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleReplyClick = (postId) => {
    navigate(`/thread/${postId}`);
  };

  const submitRating = async (postId, rating) => {
    try {
      await api.post(
        `/blogs/${postId}/rate`,
        { rating },
        {
          headers: { "X-Token": userToken },
        }
      );
      setSelectedPost(null); // Close the pop-up after submitting
      // Update the rating for this post only
      const updatedPosts = posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            averageRating:
              post.averageRating === 0
                ? rating
                : (
                    post.ratings.reduce((acc, r) => acc + r.rating, 0) /
                    post.ratings.length
                  ).toFixed(2),
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div>
      {/* Global Header for navigation */}
      {!user && <Header user={user} onLogout={logout} />}{" "}
      {/* Only render header if not logged in */}
      <div className="homepage">
        {user ? (
          <div className="welcome-message">
            Welcome, {user.user_name}! Glad to have you back on Solublog.
          </div>
        ) : (
          <div className="guest-message">
            Welcome to Solublog! Sign up to join Solublog today and connect with
            other tech enthusiasts!
          </div>
        )}

        <h2>All Blog Posts</h2>

        {user && (
          <button className="create-post-button">
            <Link to="/create-blog">+ Create New Post</Link>
          </button>
        )}

        {loading ? (
          <p>Loading posts...</p>
        ) : (
          <div className="post-list">
            {posts.length ? (
              posts.map((post) => (
                <div key={post._id} className="post-item">
                  <h3>{post.title}</h3>
                  <p>{post.content.substring(0, 100)}...</p>
                  <Link to={`/thread/${post._id}`}>Read More</Link>
                  <div className="post-meta">
                    <span>Replies: {post.replyCount || 0}</span>
                    <span>Rating: {post.averageRating || 0} ★</span>
                  </div>
                  <div className="post-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                      }}
                    >
                      Rate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplyClick(post._id);
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No posts available. Be the first to create one!</p>
            )}
          </div>
        )}
      </div>
      {selectedPost && (
        <div className="rating-popup">
          <div className="rating-container">
            <h3>Rate this Post</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="star"
                  onClick={() => submitRating(selectedPost._id, star)}
                >
                  ★
                </span>
              ))}
            </div>
            <button onClick={() => setSelectedPost(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
