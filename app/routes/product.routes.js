const controller = require("../controllers/product.controller");
const { authJwt } = require("../middlewares/index");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../controllers/isvalid.controller");

module.exports = function (app) {
  console.log("test dataset");

  app.post("/api/getAll", controller.getAll);

  app.post("/api/addProduct", verifyTokenAndAdmin, controller.addProduct); //verifyTokenAndAdmin

  app.put(
    "/api/updateProduct/:_id",
    verifyTokenAndAdmin,
    controller.updateProduct
  ); //verifyTokenAndAdmin,

  app.delete(
    "/api/deleteProduct/:_id",
    verifyTokenAndAdmin,
    controller.deleteProduct
  ); //verifyTokenAndAdmin,

  app.get("/api/find/:_id", controller.findProduct);

  app.post("/api/findAll", controller.findAllProduct);
};
