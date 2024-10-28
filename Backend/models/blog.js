// models/blog.js
import dbClient from '../../Utils/db';

class Blog {
  constructor() {
    this.collection = dbClient.db.collection('users');
  }

  async createPost(data) {
    const post = await this.collection.insertOne(data);
    return post.insertedId;
  }

  async getPost(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async getAllPosts() {
    return this.collection.find({}).toArray();
  }

  async updatePost(id, data) {
    return this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
  }

  async deletePost(id) {
    return this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}

const blogModel = new Blog();
export default blogModel;
