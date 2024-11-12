// src/pages/SearchPage.js
import React, { useState } from "react";
import api from "../services/api";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.get(`/blogs/s/search`, {
        params: { query: query },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page-container">
      <h2>Search Posts</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for blog posts..."
          required
        />
        <button type="submit">Search</button>
      </form>
      <div className="search-results">
        {loading ? (
          <p>Loading...</p>
        ) : results.length > 0 ? (
          results.map((post) => (
            <div key={post._id} className="search-result-item">
              <h3>{post.title}</h3>
              <p>{post.content.slice(0, 100)}...</p>
              <a href={`/thread/${post._id}`}>Read more</a>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
