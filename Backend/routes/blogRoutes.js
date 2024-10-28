import express from 'express';
import blogController from '../controllers/blogController';
//import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Route to create a new blog post
router.post('/create', blogController.createPost);

// Route to retrieve all blog posts
router.get('/all', blogController.getAllPosts);

// Route to get a single blog post by ID
router.get('/:id', blogController.getPost);

// Route to update a blog post by ID
router.put('/:id', blogController.updatePost);

// Route to delete a blog post by ID
router.delete('/:id', blogController.deletePost);

export default router;
