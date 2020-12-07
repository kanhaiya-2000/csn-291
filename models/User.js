const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const schema = mongoose.Schema;
const userSchema = new schema({
  fullname: {
    type: String,
    required: [true, "Your fullname"],
    trim: true,
  },
  tempid:{
    type:String,
    required:true
  },
  username: {
    type: String,
    required: [true, "Your username"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Your email"],
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],   
    //defines length restriction on password
  },
  socketId:{
    type:[String]
  },
  hostel:{
     type:String,
     required:true
  },
  institute_id:{
      type:Number,
      required:true,
  },
  avatar: {
    type: String,
    default:
      "https://kkleap.github.io/assets/default.jpg",      
  },
  bio: String,
  website: String,
  followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  followerCount: {
    type: Number,
    default: 0,
  },
  following:[{type: mongoose.Schema.ObjectId, ref: "User" }],
  followingCount: {
    type: Number,
    default: 0,
  },
  posts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  postCount: {
    type: Number,
    default: 0,
  },
  taggedComplaints:[{type:mongoose.Schema.ObjectId,ref:"Post"}],
  savedComplaints: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id,tempid:this.tempid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
userSchema.methods.updatePassword = async function (password,tempid){
  const salt = await bcrypt.genSalt(10);
  const pass = await bcrypt.hash(password, salt);
  this.password = pass;
  this.tempid = tempid;
}
userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);