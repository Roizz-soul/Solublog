import {
  ObjectId,
} from 'mongodb';
import {
  env,
} from 'process';
import {
  v4 as uuidv4,
} from 'uuid';
import path from 'path';
import mime from 'mime-types';
import fs from 'fs';
import Queue from 'bull';
import redisClient from '../../Utils/redis';
import dbClient from '../../Utils/db';

const fileQueue = new Queue('fileQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

/**
 * @class FilesController
 * @description Controller for files related operations
 * @exports FilesController
 */
class FilesController {
  /**
   * @method postUpload
   * @description Uploads a file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async postblog(req, res) {
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: 'Unauthorized',
      });
      return;
    }
    //const acceptedTypes = ['folder', 'file', 'image'];
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
        return res.status(400).json({ error: 'Title and content are required.' });
      }
    } else {
      //title = 'Comment/Solution';
      if (!content) {
        return res.status(400).json({ error: 'Content is required.' });
      }
    }
    /*if (!name) {
      res.status(400).send({
        error: 'Missing name',
      });
      return;
    }

    if ((!type || !acceptedTypes.includes(type))) {
      res.status(400).send({
        error: 'Missing type',
      });
      return;
    }

    if (!data && type !== 'folder') {
      res.status(400).send({
        error: 'Missing data',
      });
      return;
    }

    if (parentId) {
      const files = dbClient.db.collection('files');
      const parent = await files.findOne({
        _id: ObjectId(parentId),
      });
      if (!parent) {
        res.status(400).send({
          error: 'Parent not found',
        });
        return;
      }
      if (parent.type !== 'folder') {
        res.status(400).send({
          error: 'Parent is not a folder',
        });
        return;
      }
    }*/

    const blogposts = dbClient.db.collection('files');
    try {
      const post = await blogposts.insertOne({
        title,
        content,
        userId: user._id.toString(), // assuming user info is available after auth
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: id,
        replies: [],
        replyCount: 0,
        isReply: !!id,
        ratings: [],
        averageRating: 0.00
        });
      if (id) {
        await blogposts.updateOne(
          { _id: id },
          {
            $push: { replies: post.insertedId },
            $inc: { replyCount: 1 }
          }
        );
      }
      const postId = post.insertedId;
      res.status(201).json({ postId, post: post.ops, message: 'Blog post created successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create blog post.' });
    }

    /*const newFile = {
      name,
      type,
      parentId: parentId || 0,
      isPublic: isPublic || false,
      userId: user._id.toString(),
    };
    if (type === 'folder') {
      const files = dbClient.db.collection('files');
      const result = await files.insertOne(newFile);
      newFile.id = result.insertedId;
      delete newFile._id;
      res.setHeader('Content-Type', 'application/json');
      res.status(201).send(newFile);
    } else {
      const storeFolderPath = env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = uuidv4();
      const filePath = path.join(storeFolderPath, fileName);

      newFile.localPath = filePath;
      const decodedData = Buffer.from(data, 'base64');

      // Create directory if not exists
      const pathExists = await FilesController.pathExists(storeFolderPath);
      if (!pathExists) {
        await fs.promises.mkdir(storeFolderPath, { recursive: true });
      }
      FilesController.writeToFile(res, filePath, decodedData, newFile);
    }*/
  }

  /**
   * @method writeToFile
   * @description Helper function of @postUpload that writes the file to the disk
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async writeToFile(res, filePath, data, newFile) {
    // write to file
    await fs.promises.writeFile(filePath, data, 'utf-8');

    const files = dbClient.db.collection('files');
    const result = await files.insertOne(newFile);
    const writeResp = {
      ...newFile,
      id: result.insertedId,
    };
    delete writeResp._id;
    delete writeResp.localPath;

    // add to queue to process file thumbnails
    if (writeResp.type === 'image') {
      fileQueue.add({ userId: writeResp.userId, fileId: writeResp.id });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(201).send(writeResp);
  }

  /**
   * @method retrieveUserBasedOnToken
   * @description retrieve user based on auth token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async retrieveUserBasedOnToken(req) {
    const authToken = req.header('X-Token') || null;
    if (!authToken) return null;
    const token = `auth_${authToken}`;
    const user = await redisClient.get(token);
    if (!user) return null;
    const users = dbClient.db.collection('users');
    const userDoc = await users.findOne({
      _id: ObjectId(user),
    });
    if (!userDoc) return null;
    return userDoc;
  }

  /**
   * @method getShow
   * @description retrieve files based on id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async getPost(req, res) {
    const {
      id,
    } = req.params;
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: 'Unauthorized',
      });
      return;
    }

    const blogposts = dbClient.db.collection('files');
    try {
      const post = await blogposts.findOne({
		_id: ObjectId(id),
		//userId: user._id,
	  });
      if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
      }
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve blog post.' });
    }/*
    const files = dbClient.db.collection('files');
    const file = await files.findOne({
      _id: ObjectId(id),
      userId: user._id,
    });
    if (!file) {
      res.status(404).send({
        error: 'Not found',
      });
    } else {
      file.id = file._id;
      delete file._id;
      delete file.localPath;
      res.status(200).send(file);
    }*/
  }

  /**
   * @method getIndex
   * @description retrieve files based on parentid and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async getAllPosts(req, res) {
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: 'Unauthorized',
      });
      return;
    }
    /*const {
      parentId,
      page,
    } = req.query;*/
    const blogposts = dbClient.db.collection('files');
    try {
      const posts = await blogposts.find({}).toArray();
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve blog posts.' });
    }/*

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
   * @method putPublish
   * @description set isPublic to true on the file document based on the ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static putPublish(req, res) {
    FilesController.pubSubHelper(req, res, true);
  }

  /**
   * @method putUnpublish
   * @description set isPublic to false on the file document based on the ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static putUnpublish(req, res) {
    FilesController.pubSubHelper(req, res, false);
  }

  /**
   * @method pubSubHelper
   * @description helper method for @putPublish and @putUnpublish
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Boolean} isPublic - isPublic value to set
   * @returns {Object} - Express response object
   */
  static async updatePost(req, res) {
    const {
      id,
    } = req.params;
    const { title, content } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'Title or content is required.' });
    }
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: 'Unauthorized',
      });
      return;
    }
    const blogposts = dbClient.db.collection('files');
    try {
      const updated = await blogposts.updateOne(
        { _id: ObjectId(id) },
        { $set: { title, content, updatedAt: new Date() } }
      );
      if (updated.modifiedCount === 0) {
        return res.status(404).json({ error: 'Post not found or no changes made.' });
      }
      res.status(200).json({ message: 'Blog post updated successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update blog post.' });
    }
    /*
    const file = await blogposts.findOne({
      userId: user._id,
      _id: ObjectId(id),
    });

    if (!file) {
      res.status(404).send({
        error: 'Not found',
      });
    } else {
      const update = {
        $set: {
          isPublic: updateValue,
        },
      };
      await files.updateOne({
        _id: ObjectId(id),
      }, update);
      const updatedFile = await files.findOne({
        _id: ObjectId(id),
      });
      updatedFile.id = updatedFile._id;
      delete updatedFile._id;
      delete updatedFile.localPath;
      res.status(200).send(updatedFile);
    }*/
  }

  static async deletePost(req, res) {
    const {
      id,
    } = req.params;
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: 'Unauthorized',
      });
      return;
    }
    const blogposts = dbClient.db.collection('files');
    try {
      const post = await blogposts.findOne({ _id: new ObjectId(id) });
      if (!post) {
        return res.status(404).json({ error: 'Post not found.' }); 
      }

      if (post.parentId) {
        await blogposts.updateOne(
          { _id: post.parentId },
          {
            $pull: { replies: post._id },
            $inc: { replyCount: -1 }
          }
        );
      }
      const deleted = await blogposts.deleteOne({ _id: new ObjectId(id) });
      if (deleted.deletedCount === 0) {
        return res.status(404).json({ error: 'Post not found.' });
      }
      res.status(200).json({ message: 'Blog post deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete blog post.' });
    }
  }


  static async ratePost(req, res) {
    const {
      id,
    } = req.params;
    const { rating } = req.body;
    if (!rating) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const user = await FilesController.retrieveUserBasedOnToken(req);
    if (!user) {
      res.status(401).send({
        error: 'Unauthorized',
      });
      return;
    }
    const blogposts = dbClient.db.collection('files');
    try {
      const post = await blogposts.findOne({ _id: new ObjectId(id)});
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user has rated the post
      if (post.ratings.some(r => r.userId === post.userId)) {
        return res.status(400).json({ error: 'User has already rated this post' });
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
            averageRating: parseFloat(averageRating) // Convert to float
          }
        }
      );

      res.status(200).json({ ratedPost,  message: 'Post rated successfully', averageRating });
    } catch (error) {
      console.error('Error rating post: ', error);
      res.status(500).json({ error: 'An error occurred while rating the post' });
    }
  }

  static async searchPosts(req, res) {
    const { query } = req.query; // Get the search query from the URL
    const blogposts = dbClient.db.collection('files');
    try {
      const posts = await blogposts.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      }).toArray();

      res.status(200).json(posts);
    } catch (error) {
      console.error('Error searching posts:', error);
      res.status(500).json({ error: 'An error occurred while searching for posts' });
    }
  }


  /**
   * @method getFile
   * @description return the content of the file document based on the ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async getFile(req, res) {
    const {
      id,
    } = req.params;
    const { size } = req.query;
    if (!id) {
      res.status(404).send({
        error: 'Not found',
      });
      return;
    }
    const user = await FilesController.retrieveUserBasedOnToken(req);
    const files = dbClient.db.collection('files');
    const file = await files.findOne({
      _id: ObjectId(id),
    });
    if (!file) {
      res.status(404).send({
        error: 'Not found',
      });
      return;
    }
    if (!user && file.isPublic === false) {
      res.status(404).send({
        error: 'Not found',
      });
      return;
    }
    if (file.isPublic === false && user && file.userId !== user._id.toString()) {
      res.status(404).send({
        error: 'Not found',
      });
      return;
    }
    if (file.type === 'folder') {
      res.status(400).send({
        error: 'A folder doesn\'t have content',
      });
      return;
    }

    const lookUpPath = size && file.type === 'image'
      ? `${file.localPath}_${size}`
      : file.localPath;

    // check if file exists
    if (!(await FilesController.pathExists(lookUpPath))) {
      res.status(404).send({
        error: 'Not found',
      });
    } else {
      // read file with fs
      res.set('Content-Type', mime.lookup(file.name));
      res.status(200).sendFile(lookUpPath);
    }
  }

  /**
   * @method pathExists
   * @description check if the path exists
   * @param {String} path - path to check
   * @returns {Boolean} - true if path exists, false otherwise
   */
  static pathExists(path) {
    return new Promise((resolve) => {
      fs.access(path, fs.constants.F_OK, (err) => {
        resolve(!err);
      });
    });
  }
}

export default FilesController;
