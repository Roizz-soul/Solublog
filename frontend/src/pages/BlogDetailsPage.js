// src/pages/BlogDetailsPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const BlogDetailsPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await api.get(`/blogs/${id}`);
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog details:", error);
      }
    };
    fetchBlog();
  }, [id]);

  if (!blog) {
    return <p>Loading blog...</p>;
  }

  return (
    <div className="blog-details">
      <h2>{blog.title}</h2>
      <p>{blog.content}</p>
    </div>
  );
};

export default BlogDetailsPage;
