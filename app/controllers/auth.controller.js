const config = require("../config/auth.config");
const db = require("../models");
const User = require("../models/user.model");
// const User = userSchema.user;
const Role = db.role;

const nodemailer = require("../config/nodemailer.config");
// const nodemailer = require("../config/forgetpwd.config");

var crypto = require("crypto");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { forgetPasswordEmail } = require("../config/forgetpwd.config");

//signup token for verification
const getConfirmationCode = () => {

  const tokenReg = crypto.randomBytes(8).toString("hex");
  
  return tokenReg;
}

//reset password token generation
const getPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash token and set to reset password
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 86400000; // 24 hours expiry
  return resetToken;
};

exports.signup = async (req, res) => {
  console.log(req.body);
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    isAdmin: req.body.isAdmin,
    confirmationCode: bcrypt.hashSync(getConfirmationCode(), 8),
    // verifyCode: bcrypt.hashSync(`${req.body.email}${getConfirmationCode()}`, 8),
  });

  user.save((err,user) => {

    console.log(err);
    console.log(user);

    if (err) {
      res.status(500).send({ message: err });
    }

    if (req.body.roles) {
        // console.log("in if---");
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          console.log(err);
          // console.log(roles);

          if (err) {
            res.status(500).send({ message: err });
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
            }

            // res.send({ message: "User was registered successfully!" });
          });
          // console.log(user,"user");
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
          }

          // res.send({ message: "User was registered successfully!" });
        });
      });
    }

    // mail confirmation for verify the user
    nodemailer.sendConfirmationEmail(
      user.username,
      user.email,
      user.confirmationCode
      // user.verifyCode
    );
    // console.log(user,"user");
    res.send({ message: "Token generated ! Please check your mail" });

  });
};


exports.verifyUser = async (req, res) => {
  const { code } = req.query;
  try {
    const user = await db.user.findOne({ confirmationCode: code });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    } 
    user.status = "Active";
    user.confirmationCode = bcrypt.hashSync(getConfirmationCode(), 8);
    await user.save();
    return res.status(200).send({ message: "User verified successfully" }); 
    
  } catch (err) {
    return res.status(500).send({ message: "Error verifying user" });
  }
};

exports.forgetPassword = async (req, res, next) => {
  console.log(req.body);
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res
      .status(404)
      .send({ message: "There is no user with this email" });
  }

  const resetToken = getPasswordResetToken();
  user.resetToken = resetToken;
  user.resetTokenExpire = Date.now() + 86000000; 
  await user.save();

  await user.save({ validateBeforeSave: false });
  console.log(resetToken);
  console.log(user.resetPasswordToken);
  console.log(user.resetPasswordExpire);
  res.status(201).send({ message: "Mail send to respective email" });
  // create reset url
  // const resetUrl = `http://localhost:3000/api/auth/confirm/${resetToken}`;

  try {
    nodemailer.forgetPasswordEmail(
      user.email,
      // subject,
      resetToken,
    );
  } catch (error) {
    console.log(error);
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    console.log("Something went wrong to reset password email sender", error);
  }
  // next();
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Retrieve the reset token from the database
    const user = await User.findOne({ resetToken: req.query.resetToken });

    // If the reset token is invalid or has expired, return an error
    if (!user || user.resetTokenExpire < Date.now()) {
      return res.status(400).send({ message: "Invalid or expired reset token" });
    }

    // Update the user's password and reset token
    user.password = bcrypt.hashSync(req.body.password, 8);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    const password = user.password;
    console.log(password,"password");
    // Send a response with a success message
    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    // If there's an error, return an error response
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;

    const user = await User.findOne({ email: req.user.email });
    
    if (bcrypt.compareSync(oldPassword, user.password)) {
      if (newPassword === confirmNewPassword) {
        const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
        await User.updateOne({ email: req.user.email }, { $set: { password: hashedNewPassword } });
        res.send("password changed successfully");
      } else {
        res.status(400).send('New password and confirm password do not match');
      }
    } else {
      res.status(400).send('Old password is incorrect');
    }
  } catch (error) {
    // If there's an error, return an error response
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.signin = (req, res) => {
  console.log(req.body);
  User.findOne({
    email: req.body.email,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      if (user.status != "Active") {
        return res.status(401).send({
          message: "Pending Account. Please Verify Your Email!",
        });
      }

      // var pswd = req.body.password;
      // console.log(pswd, "entered pswd");
      // var pswd1 = user.password;
      // console.log(pswd1,"Database password");

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
      }

      var tokenLogin = jwt.sign({ user }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      req.session.tokenLogin = tokenLogin;

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        tokenLogin: tokenLogin
      });
    });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};
