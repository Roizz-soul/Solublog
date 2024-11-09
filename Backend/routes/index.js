import { Router } from "express";
import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";
import FilesController from "../controllers/FilesController";

const router = Router();

// check status and stats of db
router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);

// connect and disconnect user or login and logout user
router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);

// upload post and get posts
router.post("/blogs/:id?", FilesController.postblog);
router.get("/blogs/:id", FilesController.getPost);
router.get("/blogs", FilesController.getAllPosts);

// rate post and search
router.post("/blogs/:id/rate", FilesController.ratePost);
router.get("/blogs/s/search", FilesController.searchPosts);

// update and delete
router.put("/blogs/:id", FilesController.updatePost);
router.delete("/blogs/:id", FilesController.deletePost);

// user
router.post("/register", UsersController.postNew);
router.get("/users/me", UsersController.getMe);
router.get("/users", UsersController.getAllUsers);
router.get("/users/:id", UsersController.getUser);
router.put("/users/me/:id", UsersController.updateUser);
router.delete("/users/:id", UsersController.deleteUser);

// Password resetting
router.post("/request-password-reset", UsersController.requestPasswordReset);
router.post("/reset-password/:token", UsersController.resetPassword);

// email confirmation
router.get("/confirm-email/:token", UsersController.confirmEmail);

export default router;
