import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js"; // or wherever you export the app instance
import dbClient from "../Utils/db";

const { expect } = chai;

chai.use(chaiHttp);

describe("User API", () => {
  let userId = 0;
  let token = "";
  describe("POST /register", () => {
    it("should create a new user", (done) => {
      chai
        .request(app)
        .post("/register")
        .send({ email: "kender@example.com", password: "password123" })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an("object");
          expect(res.body.json).to.have.property("id");
          expect(res.body.json).to.have.property("email");
          done();
        });
    });

    it("should not create a user with missing fields", (done) => {
      chai
        .request(app)
        .post("/register")
        .send({ email: "test@example.com" }) // missing password
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("error").eql("Missing password");
          done();
        });
    });

    it("should not create a user with an existing email", (done) => {
      chai
        .request(app)
        .post("/register")
        .send({ email: "kender@example.com", password: "password123" })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("error").eql("Already exist");
          done();
        });
    });
  });

  // Email confirmation
  describe("Email Confirmation API", () => {
    let confirmationToken = "";
    const testUserEmail = "sandyl@example.com";
    const testUserPassword = "password123";

    // User signup and receive confirmation token
    describe("POST /register", () => {
      it("should register a new user and send a confirmation email", (done) => {
        chai
          .request(app)
          .post("/register")
          .send({ email: testUserEmail, password: testUserPassword })
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body)
              .to.have.property("message")
              .eql(
                "User created. Please check your email to confirm your account."
              );
            // Assuming the API sends back the confirmation token for testing
            confirmationToken = res.body.confirmationToken; // Only for testing; in production, token would be in email
            done();
          });
      });
    });

    // Confirm email with the token
    describe("GET /confirm-email", () => {
      it("should confirm email with a valid token", (done) => {
        chai
          .request(app)
          .get(`/confirm-email/${confirmationToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body)
              .to.have.property("message")
              .eql("Email confirmed successfully");
            done();
          });
      });

      it("should return an error with an invalid token", (done) => {
        chai
          .request(app)
          .get("/confirm-email/invalidToken")
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.have.property("error").eql("Invalid token");
            done();
          });
      });
    });

    // Login after confirmation
    describe("POST /connect after email confirmation", () => {
      it("should allow login after email is confirmed", (done) => {
        chai
          .request(app)
          .get("/connect")
          .set(
            "Authorization",
            "Basic " + btoa(testUserEmail + ":" + testUserPassword)
          )
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("token");
            done();
          });
      });
    });
  });

  // Login the user
  describe("POST /connect", () => {
    it("should login with valid credentials", (done) => {
      chai
        .request(app)
        .get("/connect")
        .set(
          "Authorization",
          "Basic " + btoa("sandyl@example.com" + ":" + "password123")
        )
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("token");
          done();
        });
    });

    it("should not login with invalid credentials", (done) => {
      chai
        .request(app)
        .get("/connect")
        .set(
          "Authorization",
          "Basic " + btoa("sandyl@example.com" + ":" + "wrpassword123")
        )
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("error").eql("Unauthorized");
          done();
        });
    });
  });

  // Access user profile
  describe("GET /users/me", () => {
    before((done) => {
      chai
        .request(app)
        .get("/connect")
        .set(
          "Authorization",
          "Basic " + btoa("sandyl@example.com" + ":" + "password123")
        )
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it("should retrieve the current user with a valid token", (done) => {
      chai
        .request(app)
        .get("/users/me")
        .set("X-Token", token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("id");
          expect(res.body).to.have.property("email");
          userId = res.body._id;
          done();
        });
    });

    it("should return unauthorized if token is invalid", (done) => {
      chai
        .request(app)
        .get("/users/me")
        .set("X-Token", "invalid_token")
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("error").eql("Unauthorized");
          done();
        });
    });
  });

  describe("Password Reset API", () => {
    let resetToken = "";
    const testUserEmail = "sandyl@example.com";
    const newPassword = "newPassword123";

    // Request a password reset
    describe("POST /request-password-reset", () => {
      it("should initiate a password reset", (done) => {
        chai
          .request(app)
          .post("/request-password-reset")
          .send({ email: testUserEmail })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body)
              .to.have.property("message")
              .eql("Password reset email sent");
            // Simulate retrieving the reset token from the email or database
            resetToken = res.body.resetToken; // Assuming the API returns this for testing purposes
            done();
          });
      });

      it("should return an error if the email does not exist", (done) => {
        chai
          .request(app)
          .post("/request-password-reset")
          .send({ email: "nonexistent@example.com" })
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("error").eql("User not found");
            done();
          });
      });
    });

    // Confirm password reset using the reset token
    describe("POST /reset-password/:token", () => {
      it("should reset the password with a valid token", (done) => {
        chai
          .request(app)
          .post(`/reset-password/${resetToken}`)
          .send({
            newPassword,
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body)
              .to.have.property("message")
              .eql("Password has been reset successfully");
            done();
          });
      });

      it("should return an error with an invalid token", (done) => {
        chai
          .request(app)
          .post(`/reset-password/invalid_token`)
          .send({
            newPassword,
          })
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body)
              .to.have.property("error")
              .eql("Invalid or expired token");
            done();
          });
      });
    });

    // Confirm login with the new password
    describe("POST /login with new password", () => {
      it("should allow login with the new password", (done) => {
        chai
          .request(app)
          .get("/connect")
          .set(
            "Authorization",
            "Basic " + btoa("sandyl@example.com" + ":" + "newPassword123")
          )
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("token");
            done();
          });
      });

      it("should not allow login with the old password", (done) => {
        chai
          .request(app)
          .get("/connect")
          .set(
            "Authorization",
            "Basic " + btoa("sandyl@example.com" + ":" + "password123")
          )
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.have.property("error").eql("Unauthorized");
            done();
          });
      });
    });
  });
});

describe("User Deletion API", () => {
  let token = "";

  it("should login with valid credentials", (done) => {
    chai
      .request(app)
      .get("/connect")
      .set(
        "Authorization",
        "Basic " + btoa("sandyl@example.com" + ":" + "newPassword123")
      )
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("token");
        token = res.body.token;
        done();
      });
  });

  describe("DELETE /users", () => {
    it("should delete a user with a valid ID", (done) => {
      chai
        .request(app)
        .delete("/users")
        .set("X-Token", token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .eql("User deleted successfully");
          done();
        });
    });

    it("should not delete a user with a nvalid token", (done) => {
      chai
        .request(app)
        .delete("/users")
        .set("X-Token", "invalid_token")
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("error").eql("Unauthorized");
          done();
        });
    });
  });
});
