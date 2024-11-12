import { Router } from "express";
import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";
import FilesController from "../controllers/FilesController";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Ensure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

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

// rate post and search and notifications
router.post("/blogs/:id/rate", FilesController.ratePost);
router.get("/blogs/s/search", FilesController.searchPosts);
router.get("/notifications", FilesController.getNotifications);

// update and delete
router.put("/blogs/:id", FilesController.updatePost);
router.delete("/blogs/:id", FilesController.deletePost);

// user
router.post("/register", UsersController.postNew);
router.get("/users/me", UsersController.getMe);
router.get("/users", UsersController.getAllUsers);
router.get("/users/:id", UsersController.getUser);
router.post(
  "/users/me/:id",
  upload.single("profile_picture"),
  UsersController.updateUser
);
router.delete("/users", UsersController.deleteUser);

// Password resetting
router.post("/request-password-reset", UsersController.requestPasswordReset);
router.post("/reset-password/:token", UsersController.resetPassword);

// email confirmation
router.get("/confirm-email/:token", UsersController.confirmEmail);

export default router;
