import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js";

const { expect } = chai;
chai.use(chaiHttp);

describe("Blog API", () => {
  let postId = "";
  let token = "";

  before((done) => {
    // Log in user and set token
    chai
      .request(app)
      .get("/connect")
      .set("Authorization", "Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=")
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  // Create a blog post
  describe("POST /blogs", () => {
    it("should create a new blog post", (done) => {
      chai
        .request(app)
        .post("/blogs")
        .set("X-Token", token)
        .send({
          title: "First Post",
          content: "This is the content of the first post",
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("postId");
          postId = res.body.postId;
          done();
        });
    });
  });

  // Retrieve all blog posts
  describe("GET /blogs", () => {
    it("should retrieve all blog posts", (done) => {
      chai
        .request(app)
        .get("/blogs")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });
  });

  // Retrieve a single blog post
  describe("GET /blogs/:id", () => {
    it("should retrieve a single blog post", (done) => {
      chai
        .request(app)
        .get(`/blogs/${postId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          //expect(res.body).to.have.property("_id").eql(postId);
          expect(res.body).to.have.property("title");
          expect(res.body).to.have.property("content");
          done();
        });
    });
  });

  // Update a blog post
  describe("PUT /blogs/:id", () => {
    it("should update an existing blog post", (done) => {
      chai
        .request(app)
        .put(`/blogs/${postId}`)
        .set("X-Token", token)
        .send({ title: "Updated Title", content: "Updated content" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .eql("Blog post updated successfully!");
          done();
        });
    });
  });

  // Delete a blog post
  describe("DELETE /blogs/:id", () => {
    it("should delete a blog post", (done) => {
      chai
        .request(app)
        .delete(`/blogs/${postId}`)
        .set("X-Token", token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
