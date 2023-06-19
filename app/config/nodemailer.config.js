const nodemailer = require('nodemailer');
const config = require('./auth.config');

const user = config.user;
const pass = config.pass;

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: user, 
        pass: pass
    },
});

module.exports.sendConfirmationEmail = (username, email, confirmationCode) => {
    
    console.log("Check");
    
    transport.verify(function (error, success) {
        if (error) {
              console.log(error);
        } else {
              console.log('Server is ready to take our messages');
        }
      });
    const verificationLink = `http://localhost:3000/Confirm?code=${confirmationCode}`;
    transport.sendMail({
        from: user,
        to: email,
        subject: "Please confirm your Account",
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${username}</h2>
        <p>Thanks for Subscribing us. Please confirm your account by click on the following link</p>
        <a href="${verificationLink}">Click Here</a>
        </div>`,
    })
        .catch(err => console.log(err));
};

module.exports.forgetPasswordEmail = (email, resetToken) => {
    
    console.log("Check");
    
    transport.verify(function (error, success) {
        if (error) {
              console.log(error);
        } else {
              console.log('Server is ready to take our messages');
        }
      });
    
      const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}`;
    
    transport.sendMail({
        from: user,
        to: email,
        subject: "For Reset your password",
        html: `<h1>Password reset here</h1>
        <h2>Hello ${email}</h2>
        <p>Thanks for Subscribing us. Please confirm your account by click on the following link</p>
        <a href="${resetLink}">Click Here</a>
        </div>`,
    })
        .catch(err => console.log(err));

};
