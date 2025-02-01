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
});
