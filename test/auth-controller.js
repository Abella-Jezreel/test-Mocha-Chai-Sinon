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
});
