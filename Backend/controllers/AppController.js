import redisClient from "../../Utils/redis";
import dbClient from "../../Utils/db";

// Appcontroller to check if databases are up and running
class AppController {
  // getStatus checks if redis and mongo are up and running
  static getStatus(_req, res) {
    const json = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    res.status(200).send(json);
  }
  // getStats shows the mongo database
  static async getStats(_req, res) {
    const json = {
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
      notifications: await dbClient.nbNotifications(),
    };
    res.status(200).send(json);
  }
}

export default AppController;
