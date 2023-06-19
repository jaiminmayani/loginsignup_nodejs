const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  password: {type: String},
  status: {
    type: String, 
    enum: ['Pending', 'Active'],
    default: 'Pending'
  },
  confirmationCode: { 
    type: String, 
    unique: true
  },
  verifyCode: {
    type: String,
    unique: true
  },
  isAdmin: {
    type: Boolean,
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
  resetToken: {
    type: String,
  },
  resetTokenExpire: {
    type: Date,
  }
},
  { collection: 'User', timestamps: true}
);

module.exports = mongoose.model('User', userSchema);
