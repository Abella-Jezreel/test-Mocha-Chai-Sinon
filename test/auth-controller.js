const expect = require("chai").expect;
const sinon = require("sinon");

const authController = require("../controllers/auth");
const User = require("../models/user");

describe("Auth Controller", function () {
  it("should throw an error with code 500 if accessing the database fails", async function () {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "",
        password: "tester",
      },
    };

    try {
      await authController.login(req, {}, (err) => {
        throw err;
      });
    } catch (err) {
      expect(err).to.be.an("error");
      expect(err).to.have.property("statusCode", 500);
    }

    User.findOne.restore();
  });

  it("should send a response with a valid user status for an existing user", async function () {
    sinon.stub(User, "findById");
    User.findById.resolves({ status: "I am new!" });

    const req = { userId: "5f447132b4f3f6a7b8e9f2e7" };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };

    await authController.getUserStatus(req, res, () => {});

    expect(res.statusCode).to.be.equal(200);
    expect(res.userStatus).to.be.equal("I am new!");

    User.findById.restore();
  });

  it("should update the user status", async function () {
    const req = {
      userId: "5f447132b4f3f6a7b8e9f2e7",
      body: {
        status: "I am updated!"
      }
    };
    const res = {
      statusCode: 500,
      message: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };

    sinon.stub(User, "findById").resolves({
      status: "I am new!",
      save: sinon.stub().resolves()
    });

    await authController.updateUserStatus(req, res, () => {});

    expect(res.statusCode).to.be.equal(200);
    expect(res.message).to.be.equal("User updated.");
    expect(User.findById.called).to.be.true;

    User.findById.restore();
  });

  it("should return 404 if user is not found", async function () {
    const req = {
      userId: "5f447132b4f3f6a7b8e9f2e7",
      body: {
        status: "I am updated!"
      }
    };
    const res = {};
    const next = sinon.spy();

    sinon.stub(User, "findById").resolves(null);

    await authController.updateUserStatus(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.firstCall.args[0];
    expect(error).to.be.an("error");
    expect(error).to.have.property("statusCode", 404);

    User.findById.restore();
  });

  it("should handle errors correctly", async function () {
    const req = {
      userId: "5f447132b4f3f6a7b8e9f2e7",
      body: {
        status: "I am updated!"
      }
    };
    const res = {};
    const next = sinon.spy();

    sinon.stub(User, "findById").throws();

    await authController.updateUserStatus(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.firstCall.args[0];
    expect(error).to.be.an("error");
    expect(error).to.have.property("statusCode", 500);

    User.findById.restore();
  });
});
