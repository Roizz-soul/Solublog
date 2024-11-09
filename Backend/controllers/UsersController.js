import { createHash } from "crypto";
import crypto from "crypto";
import nodemailer from "nodemailer";
import path from "path";
import { ObjectId } from "mongodb";
import dbClient from "../../Utils/db";
import redisClient from "../../Utils/redis";

/**
 * @class UsersController
 * @description This class handles all authorization related requests
 */
class UsersController {
  /**
   * @param {object} req
   * @param {object} res
   * @returns {object} user
   * @memberof UsersController
   * @description This method creates a new user
   */
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).send({
        error: "Missing email",
      });
      return;
    }
    if (!password) {
      res.status(400).send({
        error: "Missing password",
      });
      return;
    }
    const users = dbClient.db.collection("users");

    // Check if user already exists
    const user = await users.findOne({
      email,
    });
    if (user) {
      res.status(400).send({
        error: "Already exist",
      });
      return;
    }

    // Generate a confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    // Add new user
    const hash = createHash("sha1").update(password).digest("hex");
    const newUser = await users.insertOne({
      email,
      password: hash,
      isConfirmed: false,
      confirmationToken,
    });
    // Send confirmation email
    UsersController.sendConfirmationEmail(
      newUser.insertedId,
      email,
      confirmationToken
    );
    const json = {
      id: newUser.insertedId,
      email,
    };
    res.status(201).send({
      json,
      message: "User created. Please check your email to confirm your account.",
    });
  }

  /**
   * @param {object} req
   * @param {object} res
   * @returns {object} user
   * @description This method retrieves user data based on user based token
   */
  static async getMe(req, res) {
    const authToken = req.header("X-Token") || null;
    if (!authToken) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    const token = `auth_${authToken}`;
    const user = await redisClient.get(token);
    if (!user) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    const users = dbClient.db.collection("users");
    const userDoc = await users.findOne({
      _id: ObjectId(user),
    });
    if (userDoc) {
      res.status(200).send({
        id: user,
        email: userDoc.email,
      });
    } else {
      res.status(401).send({
        error: "Unauthorized",
      });
    }
  }

  /**
   * @method requestPasswordReset
   * @description request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async requestPasswordReset(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ error: "Email is required" });
    }

    const users = dbClient.db.collection("users");
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Generate a reset token and expiration time (1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour from now

    await users.updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpiration } }
    );

    // Send reset email
    const resetLink = `http://172.29.247.203:5000/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your email service
      auth: {
        user: "oabraham096@gmail.com",
        pass: "miracle12",
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Solublog user Password Reset",
      html: `<p>Solublog user Password Reset</p>
             <p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 1 hour.</p>`,
    });

    return res.status(200).send({ message: "Password reset email sent" });
  }

  /**
   * @method resetPassword
   * @description password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).send({ error: "New password is required" });
    }

    const users = dbClient.db.collection("users");
    const user = await users.findOne({ resetToken: token });

    if (!user || user.resetTokenExpiration < Date.now()) {
      return res.status(400).send({ error: "Invalid or expired token" });
    }

    const hashedPassword = crypto
      .createHash("sha1")
      .update(newPassword)
      .digest("hex");

    await users.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiration: "" },
      }
    );

    res.status(200).send({ message: "Password has been reset successfully" });
  }

  /**
   * @method sendConfirmationEmail
   * @description send confirmation email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async sendConfirmationEmail(userId, email, confirmationToken) {
    const confirmationLink = `http://172.29.247.203:5000/confirm-email/${confirmationToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "oabraham096@gmail.com",
        pass: "miracle12",
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Confirm Your Email",
      html: `<Solublog confirmation mail</p>
             <p>Thank you for signing up! Please confirm your email by clicking the link below:</p>
             <a href="${confirmationLink}">${confirmationLink}</a>`,
    });
  }

  /**
   * @method confirmEmail
   * @description confim email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async confirmEmail(req, res) {
    const { token } = req.params;
    const users = dbClient.db.collection("users");
    const user = await users.findOne({ confirmationToken: token });

    if (!user) {
      return res.status(400).send({ error: "Invalid token" });
    }

    if (!token) {
      return res.status(400).send({ error: "Missing token" });
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { isConfirmed: true }, $unset: { confirmationToken: "" } }
    );

    res.status(200).send({ message: "Email confirmed successfully" });
  }

  /**
   * @method getAllUsers
   * @description retrieve all Users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async getAllUsers(req, res) {
    // const user = await FilesController.retrieveUserBasedOnToken(req);
    // if (!user) {
    //   res.status(401).send({
    //     error: 'Unauthorized',
    //   });
    //   return;
    // }
    /*const {
      parentId,
      page,
    } = req.query;*/
    const users = dbClient.db.collection("users");
    try {
      const allUsers = await users
        .find(
          {},
          {
            projection: {
              password: 0,
              confirmationToken: 0,
              resetToken: 0,
              resetTokenExpiration: 0,
            },
          }
        )
        .toArray();
      res.status(200).json(allUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve blog users." });
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
   * @method getUser
   * @description retrieve posts based on id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async getUser(req, res) {
    const { id } = req.params;
    // const user = await FilesController.retrieveUserBasedOnToken(req);
    // if (!user) {
    //   res.status(401).send({
    //     error: 'Unauthorized',
    //   });
    //   return;
    // }

    const users = dbClient.db.collection("users");
    try {
      const user = await users.findOne(
        {
          _id: ObjectId(id),
          //userId: user._id,
        },
        { projection: { password: 0 } }
      );
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user." });
    }
  }

  /**
   * @method updateUser
   * @description Update or edit User profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Express response object
   */
  static async updateUser(req, res) {
    const authToken = req.header("X-Token") || null;
    if (!authToken) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    const token = `auth_${authToken}`;
    const user = await redisClient.get(token);
    if (!user) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    const { id } = req.params;
    const {
      full_name,
      user_name,
      bio,
      //profile_picture,
      location,
      occupation,
      /* favourite topics */ interests,
      skills,
      social_links,
      portfolio,
    } = req.body;

    const users = dbClient.db.collection("users");
    // Validate and handle the file data
    const file = req.files?.profilePicture;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!file.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ error: "Invalid file type. Only images are allowed" });
    }

    // Set up file path and save the file
    const fileName = `${Date.now()}_${id}_${file.name}`;
    const filePath = path.join("uploads", fileName);

    // Write file to the specified path
    fs.writeFileSync(filePath, file.data);

    try {
      const updated = await users.updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            full_name,
            user_name,
            bio,
            profile_picture: filePath,
            location,
            occupation,
            interests,
            skills,
            social_links,
            portfolio,
            updatedAt: new Date(),
          },
        }
      );
      if (updated.modifiedCount === 0) {
        return res
          .status(404)
          .json({ error: "Profile not found or no changes made." });
      }
      res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update Profile." });
    }
  }

  /**
   * @param {object} req
   * @param {object} res
   * @returns {object} response message
   * @description Deletes a user based on user ID
   */
  static async deleteUser(req, res) {
    const authToken = req.header("X-Token") || null;
    if (!authToken) {
      res.status(402).send({
        error: "Unauthorized",
      });
      return;
    }
    const token = `auth_${authToken}`;
    const user = await redisClient.get(token);
    if (!user) {
      res.status(401).send({
        error: "Unauthorized",
      });
      return;
    }
    const userId = req.params.id;

    // Check if userId is provided and valid
    if (!ObjectId.isValid(userId)) {
      res.status(400).send({ error: "Invalid user ID" });
      return;
    }

    try {
      const users = dbClient.db.collection("users");
      const result = await users.deleteOne({ _id: new ObjectId(userId) });

      if (result.deletedCount === 0) {
        res.status(404).send({ error: "User not found" });
      } else {
        res.status(200).send({ message: "User deleted successfully" });
      }
    } catch (error) {
      res
        .status(500)
        .send({ error: "An error occurred while deleting the user" });
    }
  }
}

export default UsersController;
