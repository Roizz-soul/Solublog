import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const handleEditPost = (postId) => {
  navigate(`/edit-post/${postId}`);  // Navigate to an edit page
};

const handleDeletePost = async (postId) => {
  try {
    await api.delete(`/posts/${postId}`);
    setUserPosts(userPosts.filter((post) => post._id !== postId));  // Remove deleted post from list
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};


function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data
    api.get('/user/profile')
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        navigate('/login');  // Redirect if not authenticated
      });

    // Fetch posts by this user
    api.get('/posts/user')
      .then((response) => {
        setUserPosts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user posts:', error);
      });
  }, [navigate]);

  return (
    <div>
      <h1>Profile</h1>
      {user && (
        <div>
          <h2>Welcome, {user.name}</h2>
          <p>Email: {user.email}</p>
        </div>
      )}

      <h2>Your Posts</h2>
      {userPosts.length > 0 ? (
        userPosts.map((post) => (
          <div key={post._id} style={{ marginBottom: '20px' }}>
            <h3>{post.title}</h3>
            <p>{post.content.slice(0, 100)}...</p>
            <button onClick={() => handleEditPost(post._id)}>Edit</button>
            <button onClick={() => handleDeletePost(post._id)}>Delete</button>
          </div>
        ))
      ) : (
        <p>No posts yet.</p>
      )}
    </div>
  );
}

export default ProfilePage;

