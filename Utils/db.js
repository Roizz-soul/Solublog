import { MongoClient } from "mongodb";
import { env } from "process";

class DBClient {
  constructor() {
    this.host = env.DB_HOST || "localhost";
    this.port = env.DB_PORT || 27017;
    this.dbName = env.DB_DATABASE || "solublog";
    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(this.dbName);
      })
      .catch((err) => {
        console.error("Could not connect to mongodb", err.message);
      });
  }

  isAlive() {
    if (this.db) return true;
    return false;
  }

  async nbUsers() {
    const collection = this.db.collection("users");
    return collection.countDocuments();
  }

  async nbFiles() {
    const collection = this.db.collection("files");
    return collection.countDocuments();
  }

  async nbNotifications() {
    const collection = this.db.collection("notifications");
    return collection.countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
