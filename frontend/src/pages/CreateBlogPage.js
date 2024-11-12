// src/pages/CreateBlogPage.js
import React, { useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateBlogPage = () => {
  const { userToken } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/blogs",
        { title, content },
        {
          headers: { "X-Token": userToken },
        }
      );
      navigate("/"); // Redirect to HomePage after successful post creation
    } catch (error) {
      console.error("Error creating blog post:", error);
    }
  };

  return (
    <div className="create-blog-container">
      <h2>Create a New Blog Post</h2>
      <form onSubmit={handleSubmit} className="create-blog-form">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter blog title"
        />

        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your blog content here..."
        />

        <button type="submit">Publish Post</button>
      </form>
    </div>
  );
};

export default CreateBlogPage;
