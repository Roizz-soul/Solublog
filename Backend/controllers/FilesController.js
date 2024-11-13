import { ObjectId } from "mongodb";
import { env } from "process";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import mime from "mime-types";
import fs from "fs";
import Queue from "bull";
import redisClient from "../../Utils/redis";
import dbClient from "../../Utils/db";

const fileQueue = new Queue("fileQueue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

/**
 * @class FilesController
 * @description Controller for blog related operations
 * @exports FilesController
 */
class FilesController {
  // to create a notification
  static async createNotification(
    userId,
    message,
    type,
    relatedEntityId,
    user_name,
    isImportant = false
  ) {
    try {
      const notificationsCollection = dbClient.db.collection("notifications");

      const notification = {
        userId,
        user_name,
        message,
        type,
        read: false, // Newly created notification is unread
        createdAt: new Date(),
        relatedEntityId,
        isImportant,
      };

      await notificationsCollection.insertOne(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }

  /**
   * @method postblog
   * @description Uploads a blogpost
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async postblog(req, res) {
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    if (user === "NC") {
      res.status(401).send({
        error: "Please confirm email",
      });
      return;
    }
    const {
      title = null,
      content,
      /*name,
      type,
      isPublic,
      data,*/
    } = req.body;

    const id = req.params.id ? ObjectId(req.params.id) : null;

    if (id === null) {
      if (title === null || !content) {
        return res
          .status(400)
          .json({ error: "Title and content are required." });
      }
    } else {
      //title = 'Comment/Solution';
      if (!content) {
        return res.status(400).json({ error: "Content is required." });
      }
    }

    const blogposts = dbClient.db.collection("files");
    try {
      const post = await blogposts.insertOne({
        title,
        content,
        userId: user._id.toString(), // assuming user info is available after auth
        user_name: user.full_name,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: id,
        replies: [],
        replyCount: 0,
        isReply: !!id,
        ratings: [],
        averageRating: 0.0,
      });
      const postId = post.insertedId;
      if (id) {
        await blogposts.updateOne(
          { _id: id },
          {
            $push: { replies: post.insertedId },
            $inc: { replyCount: 1 },
          }
        );
        const message = `Your post has received a new comment!`;
        await FilesController.createNotification(
          user._id,
          message,
          "comment",
          postId,
          user.full_name
        );
      }
      res.status(201).json({
        postId,
        post: post.ops,
        message: "Blog post created successfully!",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create blog post." });
    }
  }

  /**
   * @method retrieveUserBasedOnToken
   * @description retrieve user based on auth token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async retrieveUserBasedOnToken(req) {
    const authToken = req.header("X-Token") || null;
    if (!authToken) return null;
    const token = `auth_${authToken}`;
    const user = await redisClient.get(token);
    if (!user) return null;
    const users = dbClient.db.collection("users");
    const userDoc = await users.findOne({
      _id: ObjectId(user),
    });
    if (!userDoc) return null;
    if (userDoc.isConfirmed === false) {
      return "NC";
    }
    return userDoc;
  }

  /**
   * @method getNotifications
   * @description retrieve notifications  for user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async getNotifications(req, res) {
    //const { id } = req.params;
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }

    try {
      const notificationsCollection = dbClient.db.collection("notifications");

      // Fetch notifications for the logged-in user, sorted by creation time
      const notifications = await notificationsCollection
        .find({ userId: user._id })
        .sort({ createdAt: -1 }) //.limit(10) // Limit to 10 notifications
        .toArray();

      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * @method getPost
   * @description retrieve posts based on id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async getPost(req, res) {
    const { id } = req.params;

    const blogposts = dbClient.db.collection("files");
    try {
      const post = await blogposts.findOne({
        _id: ObjectId(id),
        //userId: user._id,
      });
      if (!post) {
        return res.status(404).json({ error: "Post not found." });
      }
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve blog post." });
    }
  }

  /**
   * @method getAllPosts
   * @description retrieve all blogposts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async getAllPosts(req, res) {
    const blogposts = dbClient.db.collection("files");
    try {
      const posts = await blogposts.find({}).toArray();
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve blog posts." });
    } /*

    // Perform pagination
    const pageSize = 20;
    const pageNumber = page || 1;
    const skip = (pageNumber - 1) * pageSize;

    // if parentId is not provided retrieve all files
    let query;
    if (!parentId) {
      query = {
        userId: user._id.toString(),
      };
    } else {
      query = {
        userId: user._id.toString(),
        parentId,
      };
    }

    // handle pagination using aggregation
    const result = await files.aggregate([
      {
        $match: query,
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ]).toArray();

    const finalResult = result.map((file) => {
      const newFile = {
        ...file,
        id: file._id,
      };
      delete newFile._id;
      delete newFile.localPath;
      return newFile;
    });
    res.status(200).send(finalResult);*/
  }

  /**
   * @method updatePost
   * @description Update or edit blogPosts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async updatePost(req, res) {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: "Title or content is required." });
    }
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    const blogposts = dbClient.db.collection("files");
    try {
      const updated = await blogposts.updateOne(
        { _id: ObjectId(id) },
        { $set: { title, content, updatedAt: new Date() } }
      );
      if (updated.modifiedCount === 0) {
        return res
          .status(404)
          .json({ error: "Post not found or no changes made." });
      }
      res.status(200).json({ message: "Blog post updated successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update blog post." });
    }
  }

  /**
   * @method deletePost
   * @description delete blogPosts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async deletePost(req, res) {
    const { id } = req.params;
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    const blogposts = dbClient.db.collection("files");
    try {
      const post = await blogposts.findOne({ _id: new ObjectId(id) });
      if (!post) {
        return res.status(404).json({ error: "Post not found." });
      }

      if (post.parentId) {
        await blogposts.updateOne(
          { _id: post.parentId },
          {
            $pull: { replies: post._id },
            $inc: { replyCount: -1 },
          }
        );
      }
      const deleted = await blogposts.deleteOne({ _id: new ObjectId(id) });
      if (deleted.deletedCount === 0) {
        return res.status(404).json({ error: "Post not found." });
      }
      res.status(200).json({ message: "Blog post deleted successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog post." });
    }
  }

  /**
   * @method ratePost
   * @description rate questions or solutions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async ratePost(req, res) {
    const { id } = req.params;
    const { rating } = req.body;
    if (!rating) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    const blogposts = dbClient.db.collection("files");
    try {
      const post = await blogposts.findOne({ _id: new ObjectId(id) });
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if user has rated the post
      if (post.ratings.some((r) => r.userId === post.userId)) {
        return res
          .status(400)
          .json({ error: "User has already rated this post" });
      }

      // Add new rating
      post.ratings.push({ userId: post.userId, rating });

      // calculate new average rating
      const totalRatings = post.ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = (totalRatings / post.ratings.length).toFixed(2);

      // Update the post with new ratings and average rating
      const ratedPost = await blogposts.updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            ratings: post.ratings,
            averageRating: parseFloat(averageRating), // Convert to float
          },
        }
      );

      res
        .status(200)
        .json({ ratedPost, message: "Post rated successfully", averageRating });
    } catch (error) {
      console.error("Error rating post: ", error);
      res
        .status(500)
        .json({ error: "An error occurred while rating the post" });
    }
  }

  /**
   * @method searchPost
   * @description search posts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async searchPosts(req, res) {
    const { query } = req.query; // Get the search query from the URL
    const blogposts = dbClient.db.collection("files");
    try {
      const posts = await blogposts
        .find({
          $or: [
            { title: { $regex: query, $options: "i" } },
            { content: { $regex: query, $options: "i" } },
          ],
        })
        .toArray();

      res.status(200).json(posts);
    } catch (error) {
      console.error("Error searching posts:", error);
      res
        .status(500)
        .json({ error: "An error occurred while searching for posts" });
    }
  }
}

export default FilesController;
