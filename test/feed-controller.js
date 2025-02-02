const expect = require("chai").expect;
const sinon = require("sinon");
const { validationResult } = require("express-validator");

const feedController = require("../controllers/feed");
const Post = require("../models/post");

describe("Feed Controller - updatePost", function () {
  afterEach(function () {
    sinon.restore();
  });

  it("should throw an error if validation fails", async function () {
    const req = {
      params: { postId: "123" },
      body: { title: "", content: "", image: "image.jpg" },
      file: null,
    };
    sinon.stub(validationResult).returns({
      isEmpty: () => false,
    });
    const next = sinon.spy();

    try {
      await feedController.updatePost(req, {}, next);
    } catch (error) {
      expect(error).to.be.an("error");
      expect(error).to.have.property("statusCode", 422);
    }
  });

  it("should throw an error if no image is provided", async function () {
    const req = {
      params: { postId: "123" },
      body: { title: "Test", content: "Test content", image: "" },
      file: null,
    };
    sinon.stub(validationResult).returns({
      isEmpty: () => true,
    });
    const next = sinon.spy();

    try {
      await feedController.updatePost(req, {}, next);
    } catch (error) {
      expect(error).to.be.an("error");
      expect(error).to.have.property("statusCode", 422);
    }
  });

  it("should throw an error if the post is not found", async function () {
    const req = {
      params: { postId: "123" },
      body: { title: "Test", content: "Test content", image: "image.jpg" },
      file: null,
    };
    sinon.stub(validationResult).returns({
      isEmpty: () => true,
    });
    sinon.stub(Post, "findById").resolves(null);
    const next = sinon.spy();

    try {
      await feedController.updatePost(req, {}, next);
    } catch (error) {
      expect(error).to.be.an("error");
      expect(error).to.have.property("statusCode", 404);
    }
  });

  it("should update the post if all conditions are met", async function () {
    const req = {
      params: { postId: "123" },
      body: {
        title: "Updated title",
        content: "Updated content",
        image: "image.jpg",
      },
      file: { path: "new-image.jpg" },
      userId: "123",
    };
    sinon.stub(validationResult).returns({
      isEmpty: () => true,
    });
    sinon.stub(Post, "findById").resolves({
      title: "Old title",
      content: "Old content",
      imageUrl: "images/old-image.jpg",
      creator: "123",
      save: sinon.stub().resolves(),
    });
    const res = {
      statusCode: 500,
      message: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      },
    };

    await feedController.updatePost(req, res, () => {});

    expect(res.statusCode).to.be.equal(200);
    expect(res.message).to.be.equal("Post updated!");
    expect(Post.findById.called).to.be.true;
  });
});
