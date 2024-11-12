import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://172.29.247.203:5000",
});

export const fetchPosts = () => api.get("/blogs");
export const fetchPostById = (id) => api.get(`/blogs/${id}`);
export const createPost = (data) => api.post("/blogs", data);
export const updatePost = (id, data) => api.put(`/blogs/${id}`, data);
export const deletePost = (id) => api.delete(`/blogs/${id}`);

export default api;
