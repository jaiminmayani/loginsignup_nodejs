const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; //token
  if (authHeader) {

    // const token = authHeader.split(" ")[1];
    jwt.verify(authHeader, config.secret, (err, user) => {
      if (err) res.status(403).json("Token is not valid!");
      req.user = user;
      console.log(user, "user here");
      
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user._id === req.params._id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not authorized to do that!");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.user.isAdmin) {
      console.log("Here we can check admin is or not ");
      next();
    } else {
      res.status(403).json("You are not admin!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};