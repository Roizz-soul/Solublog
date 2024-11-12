// src/pages/ReplyThreadPage.js
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const ReplyThreadPage = () => {
  const { user, userToken } = useContext(AuthContext);
  const { postId } = useParams(); // Get the postId from URL parameters
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const postResponse = await api.get(`/blogs/${postId}`);
      setPost(postResponse.data);
      fetchReplies(postResponse.data);
    } catch (error) {
      console.error("Error fetching post or replies:", error);
    }
  };

  const handleReplySubmit = async () => {
    try {
      await api.post(
        `/blogs/${postId}`,
        { content: newReply },
        {
          headers: {
            "X-token": userToken,
          },
        }
      ); // Adjust endpoint and payload as needed
      setNewReply("");
      fetchPost(); // Refresh replies after submitting
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
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
      const updatedPosts = replies.map((post) => {
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
      setReplies(updatedPosts);
      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleReplyClick = (postId) => {
    navigate(`/thread/${postId}`);
  };

  const fetchReplies = async (post) => {
    let repl = [];
    if (post.replies.length === 0) {
      setReplies(repl);
      return;
    }
    for (let i = 0; i < post.replies.length; i++) {
      try {
        const repliesResponse = await api.get(`/blogs/${post.replies[i]}`);
        repl.push(repliesResponse.data);
      } catch (error) {
        console.error("Error fetching post or replies:", error);
      }
    }
    setReplies(repl);
  };

  return (
    <div className="reply-thread-container">
      <button onClick={() => navigate("/")} className="back-button">
        Back
      </button>
      {post && (
        <div className="post-details">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <div className="post-meta">
            <span>Replies: {post.replyCount || 0}</span>
            <span>Rating: {post.averageRating || 0} ★</span>
          </div>
        </div>
      )}
      <div className="replies-section">
        <h3>Replies</h3>
        {replies.map((reply) => (
          <div key={reply._id} className="reply-card">
            <p>{reply.content}</p>
            <div className="post-meta">
              <span>Replies: {reply.replyCount || 0}</span>
              <span>Rating: {reply.averageRating || 0} ★</span>
            </div>
            <div className="post-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPost(reply);
                }}
              >
                Rate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplyClick(reply._id);
                }}
              >
                Reply
              </button>
            </div>
            <small>Posted by {reply.userName}</small>
          </div>
        ))}
        <div className="new-reply">
          <textarea
            placeholder="Add your reply..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <button onClick={handleReplySubmit}>Post Reply</button>
        </div>
      </div>
      {selectedPost && (
        <div className="rating-popup">
          <div className="rating-container">
            <h3>Rate this Reply</h3>
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

export default ReplyThreadPage;
