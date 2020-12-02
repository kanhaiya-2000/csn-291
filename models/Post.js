const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  caption: {
    type: String,
    required: [true, "Enter the caption"],
    trim: true,
  },
  tags: {
    type: [String],
  },
  isPrivate:{
    type:Boolean,    
    default:false   
  },
  accessibility:{
    type:[String],
    default:[],   
  },
  resolved:{
    type:Boolean,
    default:false
  },
  files: {
    type: [String],
    default:["https://kkleap.github.io/assets/loaderi.gif"],
    validate: (v) => v === null || v.length > 0,
  },
  likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  likesCount: {
    type: Number,
    default: 0,
  },
  comments: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
  commentsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);