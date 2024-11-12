// src/components/BlogList.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

// src/components/BlogList.js
const BlogList = ({ blogs: initialBlogs }) => {
  const [blogs, setBlogs] = useState(initialBlogs || []);

  useEffect(() => {
    if (!initialBlogs) {
      const fetchBlogs = async () => {
        const response = await api.get("/blogs");
        setBlogs(response.data);
      };
      fetchBlogs();
    }
  }, [initialBlogs]);

  return (
    <div className="blog-list">
      {blogs.length > 0 ? (
        blogs.map((blog) => (
          <div key={blog._id} className="blog-card">
            <Link to={`/blogs/${blog._id}`}>
              <h3>{blog.title}</h3>
            </Link>
            <p>{blog.content.substring(0, 100)}...</p>
          </div>
        ))
      ) : (
        <p>No blogs available.</p>
      )}
    </div>
  );
};

export default BlogList;
