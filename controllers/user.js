const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const asyncHandler = require("../middleware/asynchandler");
const OTPmodel = require("../models/OTPmodel");
const nodemailer = require('nodemailer');
const { generateOTP } = require("./auth");
const Chat = require("../models/Chat");
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'complaintlodgeriitr@gmail.com',
    pass: 'hellokk1234!!'
  }
});
exports.getUsers = asyncHandler(async (req, res, next) => {
  let users = await User.find().select("-password").lean().exec();//select every user

  users.forEach((user) => {
    user.isFollowing = false;
    //set who are friend a user or not...later on only a chat between friends and friend will happen
    const followers = user.followers.map((follower) => follower._id.toString());
    if (followers.includes(req.user.id)) {
      user.isFollowing = true;
    }
  });

  users = users.filter((user) => user._id.toString() !== req.user.id);//do not include the same user

  res.status(200).json({ success: true, data: users, notices: req.notices });
});
exports.requestotp = asyncHandler(async (req, res, next) => {
  if (req.user) {
    const expires = Date.now() + 7200000;
    const OTP = generateOTP(6);
    await OTPmodel.deleteMany({email:req.user.email,type:"changepassword"});
    
    await OTPmodel.create({ type: "changepassword", email: req.user.email, expires, OTP });
    transporter.sendMail({
    to:req.user.email,
    from:"complaintlodgeriitr@gmail.com",
    subject:"OTP for changing password",
    text:"Hello "+req.user.fullname+",\nhere is the OTP for changing your account password\n"+OTP+"\n\nThis OTP will expire in 2 hours\nThis is system generated mail.So kindly do not reply.\n\nRegards\n CLTIITR",
    }).then(()=>{
    res.status(200).json({ success: true, messsage: "check your email for OTP" });
  }).catch(err=>{
    return next({
      statusCode:400,
      message:err.message
    })
  })
  }
  else {
    return next({
      statusCode: 404,
      message: "Your user id could not be confirmed"
    })
  }
})
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { password, otp } = req.body;
  if(password.length<6){
    return next({
      message:"minimum length of password must be 6",
      statusCode:404
    })
  }
  console.log(req.body);
  const otpif = await OTPmodel.findOne({ email: req.user.email, type: "changepassword", OTP: otp});
  //console.log(req.user.email,otp);  
  if (otpif) {
    const user = await User.findOne({email:req.user.email});
    const tempid = generateOTP(16);    
    await user.updatePassword(password,tempid);
    await user.save();
    const token = await user.getJwtToken();
    otpif.remove();   
    res.status(200).json({ success: true,token:token, message: "Password changed successfully" });
    
  }
  else {
    return next({
      statusCode: 404,
      message: "OTP did not match"
    })
  }

})
exports.checkUser = asyncHandler(async (req, res, next) => {

  User.findOne({ username: req.params.username }).then((user) => {
    if (user)
      res.status(200).json({ success: true });
    else
      res.status(404).json({ success: false });
  }).catch((err) => {
    return next({
      message: `The user ${req.params.username} is not found`,
      statusCode: 404,
    });
  })
})
exports.getUser = asyncHandler(async (req, res, next) => {
  let user = await User.findOne({ username: req.params.username });
  if(!user){
    return next({
      statusCode:404,
      message:"no user found"
    })
  }
  setTimeout(async function () {
    if (user._id.toString() === req.user.id) {
      user = await User.findOne({ username: req.params.username })
        .select("-password")
        .populate({ path: "posts", select: "files commentsCount likesCount accessibility createdAt" })
        .populate({ path: "savedComplaints", select: "files commentsCount likesCount accessibility createdAt" })        
        .populate({ path: "taggedComplaints", select: "files commentsCount likesCount accessibility createdAt" })
        .sort("-createdAt")
        .populate({ path: "followers", select: "avatar username fullname createdAt" })
        .sort("-createdAt")
        .populate({ path: "following", select: "avatar username fullname createdAt" })
        .sort("-createdAt")
        .lean()
        .sort("-createdAt")
        .exec();
       user.savedComplaints = user.savedComplaints.sort(function(a,b){return new Date(b.createdAt) - new Date(a.createdAt)});
    }
    else {
      user = await User.findOne({ username: req.params.username })
        .select("-password")
        .populate({ path: "posts", select: "files commentsCount likesCount accessibility createdAt" })
        .sort("-createdAt")
        .populate({ path: "taggedComplaints", select: "files commentsCount likesCount accessibility createdAt" })
        .sort("-createdAt")
        .populate({ path: "followers", select: "avatar username fullname createdAt" })
        .sort("-createdAt")
        .populate({ path: "following", select: "avatar username fullname createdAt" })
        .sort("-createdAt")
        .lean()
        .exec();
      if (user)
        user.taggedComplaints = user.taggedComplaints.filter((complain) => {
          return ((complain.accessibility.length > 0 && complain.accessibility.includes(req.user.username)) || complain.accessibility.length == 0||req.user.posts.includes(complain._id))
        })
        
    }

    if (!user) {
      return next({
        message: `The user ${req.params.username} is not found`,
        statusCode: 404,
      });
    }
    else {
      console.log(user.posts);
      user.posts = user.posts.filter((post) => {
        return req.user.posts.includes(post._id) || post.accessibility.length == 0 || (post.accessibility.length > 0 && post.accessibility.includes(req.user.username));
      })
      user.posts = user.posts.sort(function(a,b){return new Date(b.createdAt) - new Date(a.createdAt)});
      user.postCount = user.posts.length;
      //delete user.posts["user"];
      console.log(user.posts);

    }

    user.isFollowing = false;
    const followers = user.followers.map((friend) => friend._id.toString());

    user.followers.forEach((friend) => {
      friend.isFollowing = false;
      if (req.user.following.includes(friend._id.toString())) {
        friend.isFollowing = true;
      }
    });

    user.following.forEach((friend) => {
      friend.isFollowing = false;
      if (req.user.following.includes(friend._id.toString())) {
        friend.isFollowing = true;
      }
    });

    if (followers.includes(req.user.id)) {
      user.isFollowing = true;
    }
    user.followers = user.followers.sort(function(a,b){return new Date(b.createdAt) - new Date(a.createdAt)});
    user.following = user.following.sort(function(a,b){return new Date(b.createdAt) - new Date(a.createdAt)});
    user.taggedComplaints = user.taggedComplaints.sort(function(a,b){return new Date(b.createdAt) - new Date(a.createdAt)});

    user.isMe = req.user.id === user._id.toString();
    
    //console.log("\n\n\nreq.user",user);
    res.status(200).json({ success: true, data: user });
  }, 500)
});
exports.sendNotice = asyncHandler(async (req, res, next) => {
  //////console.log(req.notices);
  if (req.user) {
    Notification.find({}).sort({ createdAt: -1 }).then((notices) => {
      //////console.log(notices);
      notices = notices.filter(function (notice) {
        return notice.receiver.includes(req.user.id) || notice.receiver.includes(req.user.username);
      })
      ////console.log(notices);
      res.status(200).json({ success: true, notices });
    })
  }
  else
    return next({ success: false, message: "Unable to verify user" });
});
exports.follow = asyncHandler(async (req, res, next) => {
  // make sure the user exists
  const user = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `No user found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  // make the sure the user is not the logged in user
  if (req.params.id === req.user.id) {
    return next({ message: "Woyla!Are you a combination of 2 soul??", status: 400 });
  }

  // only become follower if the user is not following already
  if (user.followers.includes(req.user.id)) {
    return next({ message: "You are already following", status: 400 });
  }

  await User.findByIdAndUpdate(req.params.id, {
    $push: { followers: req.user.id },
    $inc: { followerCount: 1 },
    $inc:{noticeCount:1},
  });
  const noti = await Notification.create({
    sender: req.user.id,
    receiver: req.params.id,
    avatar: req.user.avatar,
    url: `/${req.user.username}`,
    notifiedMessage: `${req.user.username} started following you`
  })
  await User.findByIdAndUpdate(req.user.id, {
    $push: { following: req.params.id },
    $inc: { followingCount: 1 },
    $push: { unseennotice: noti._id },
  });

  res.status(200).json({ success: true, data: {}, notices: req.notices });
});
exports.chatList = asyncHandler(async (req, res, next) => {
  const chatlists = await Chat.find({}).populate({
    path:"participants",
    select:"avatar username"
  }).populate({
    path:"messages",
    select:"createdAt text"
  }).sort("-lastupdated");
  const rooms = chatlists.filter(function(room){
    return room.participants.toString().includes(req.user.id)&&room.messages.length>0;
  })
  const data = [];
  rooms.forEach((room)=>{
    data.push({avatar:room.participants.filter((user)=>user._id.toString()!=req.user.id)[0].avatar,username:room.participants.filter((user)=>user._id.toString()!=req.user.id)[0].username,lastmessage:room.messages[room.messages.length-1].text,timeSince:room.messages[room.messages.length-1].createdAt,uri:"/chat/t/"+room.name,id:room._id});
  })
res.status(200).json({success:true,data:data});

});
exports.unfollow = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `No user found for ID ${req.params.id}`,
      statusCode: 404,
    });
  }
 const noti =  await Notification.findOne({
    sender: req.user.id,
    receiver: [req.params.id],
    url: `/${req.user.username}`,
    notifiedMessage: `${req.user.username} started following you`
  });

  // make the sure the user is not the logged in user
  if (req.params.id === req.user.id) {
    return next({ message: "de denge do mukka nach ke gir jaoge", status: 400 });
  }
  //remove both to their friend list
  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user.id },
    $inc: { followerCount: -1 },
    $pull:{unseennotice:noti._id},
  });
  await noti.remove();
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: req.params.id },
    $inc: { followingCount: -1 },
  });

  res.status(200).json({ success: true, data: {}, notices: req.notices });
});

exports.publicfeed = asyncHandler(async (req, res, next) => {
  console.log(req.user);

  let posts = await Post.find({})
    .populate({
      path: "comments",
      select: "text",
      populate: { path: "user", select: "avatar fullname username" },
    })
    .populate({ path: "user", select: "avatar fullname username" })
    .sort("-createdAt")
    .lean()
    .exec();
  ////console.log(posts);
  posts = posts.filter(function (post) {
    return post.accessibility.includes(req.user.username) || !post.isPrivate||req.user.posts.includes(post._id);
  });
  //console.log(posts);
  posts.forEach((post) => {
    // had the loggedin user liked the post
    post.isLiked = false;
    const likes = post.likes.map((like) => like.toString());
    if (likes.includes(req.user.id)) {
      post.isLiked = true;
    }

    // had the loggedin saved this post
    post.isSaved = false;
    const savedComplaints = req.user.savedComplaints.map((post) => post.toString());
    if (savedComplaints.includes(post._id)) {
      post.isSaved = true;
    }

    // is the post belongs to the same user
    post.isMine = false;
    if (post.user._id.toString() === req.user.id) {
      post.isMine = true;
    }

    // is the comment belongs to the same user
    post.comments.map((comment) => {
      comment.isCommentMine = false;
      if (comment.user._id.toString() === req.user.id) {
        comment.isCommentMine = true;
      }
    });
  });

  res.status(200).json({ success: true, data: posts, notices: req.notices });
});

exports.searchUser = asyncHandler(async (req, res, next) => {

  if (!req.params.reg) {
    return next({ message: "The username cannot be empty", statusCode: 400 });
  }

  const regex = new RegExp(req.params.reg, "i");

  //let users = await User.find({ username: regex});
  User.find({ fullname: regex }).select("username fullname avatar").then((data) => {
    res.status(200).json({ success: true, notices: req.notices, data });
  });
  //let searchresult = users.concat(users2); 

});

exports.editDetails = asyncHandler(async (req, res, next) => {
  const { avatar, username, fullname, website, bio, email } = req.body;

  const fieldsToUpdate = {};
  if (avatar) fieldsToUpdate.avatar = avatar;
  if (username) fieldsToUpdate.username = username;
  if (fullname) fieldsToUpdate.fullname = fullname;
  if (email) fieldsToUpdate.email = email;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: { ...fieldsToUpdate, website, bio },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("avatar username fullname email bio website");

  res.status(200).json({ success: true, data: user, notices: req.notices });
});