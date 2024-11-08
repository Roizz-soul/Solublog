import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    const fetchPosts = async () => {
      console.log(localStorage.getItem("token"));
      await api
        .get("/files", {
          headers: {
            "X-Token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log(response.data);
          setPosts(response.data);
        })
        .catch((error) => setError(error));
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Solublog - Home</h1>
      {error && <p>{error}</p>}
      <ul>
        {posts.map((post) => (
          <li key={post._id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
