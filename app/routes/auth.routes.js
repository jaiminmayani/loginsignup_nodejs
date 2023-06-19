const { verifySignUp } = require("../middlewares/index");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.get("/api/auth/verify", controller.verifyUser);

  app.post("/api/auth/forgetPassword", controller.forgetPassword);  

  app.put("/api/auth/resetPassword/:resetToken", controller.resetPassword);

  app.get("/api/auth/changePassword", controller.changePassword);

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/signout", controller.signout);
};
