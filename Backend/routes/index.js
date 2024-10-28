import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = Router();

// check status and stats of db
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// connect and disconnect user or login and logout user
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// upload post
router.post('/files/:id?', FilesController.postblog);
router.get('/files/:id', FilesController.getPost);
router.get('/files', FilesController.getAllPosts);

// rate post and search
router.post('/files/:id/rate', FilesController.ratePost);
router.get('/files/s/search', FilesController.searchPosts);

// update and delete
router.put('/files/:id', FilesController.updatePost);
router.delete('/files/:id', FilesController.deletePost);

// user
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// file content
//router.get('/files/:id/data', FilesController.getFile);

export default router;
