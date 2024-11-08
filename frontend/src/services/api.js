import axios from 'axios';

const api = axios.create({
baseURL: process.env.REACT_APP_API_URL || 'http://172.29.247.203:5000',
});

export const fetchPosts = () => api.get('/files');
export const fetchPostById = (id) => api.get(`/files/${id}`);
export const createPost = (data) => api.post('/files', data);
export const updatePost = (id, data) => api.put(`/files/${id}`, data);
export const deletePost = (id) => api.delete(`/files/${id}`);

export default api;
