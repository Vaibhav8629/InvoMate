const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const UserSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  email:     { type: String, required: true },
  password:  { type: String, required: true },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  subscription: {
    type: Boolean,
    default: true
  },

  signature: {
    url:       { type: String, default: null },
    public_id: { type: String, default: null },
  },
});

UserSchema.pre('save', async function () {
  const user = this;
  if (!user.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;
});

UserSchema.methods.generateToken = async function () {
  const payload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role, 
  }
  try {
    return jwt.sign(payload, process.env.JWT_SIGN, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
  }
}

const User = new mongoose.model("User", UserSchema);
module.exports = User;