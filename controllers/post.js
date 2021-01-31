const Post = require("../models/Post");
const User = require("../models/User");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const Comment = require("../models/Comment");
const asyncHandler = require("../middleware/asynchandler");


exports.getPosts = asyncHandler(async (req, res, next) => {
  Post.find({}).sort({ createdAt: -1 }).then((posts) => {
    posts = posts.filter(function (post) {
      return post.user._id.toString() == req.user.id || !post.isPrivate || (post.accessibility.includes(req.user.username))
    });
    res.status(200).json({ success: true, data: posts, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
  });
});

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: "comments",
      select: "text createdAt",
      populate: {
        path: "user",
        select: "username avatar",
      },
    })
    .populate({
      path: "user",
      select: "username avatar",
    })
    .lean()
    .exec();

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }
  post.isMine = req.user.id === post.user._id.toString();
  if (!post.isMine && post.isPrivate && !post.accessibility.includes(req.user.username)) {
    return next({
      message: "You are not authorised to access this post",
      statusCode: 401,
    })
  }
  post.likers = [];
  post.isLiked = post.likes.toString().includes(req.user.id);
  post.likes.forEach(async function (id) {
    ////////console.log(id);
    let user = await User.findById(id).lean().exec();
    ////////console.log(user);
    if (user) {
      //////console.log(user);
      post.likers.push({ username: user.username, id: id.toString(), avatar: user.avatar, fullname: user.fullname });

      ////////console.log(likes)
    }
  })

  // is the loggedin user liked the post??
  const savedComplaints = req.user.savedComplaints.map((post) => post.toString());
  post.isSaved = savedComplaints.includes(req.params.id);

  // is the comment on the post belongs to the logged in user?
  post.comments.forEach((comment) => {
    comment.isCommentMine = false;

    const userStr = comment.user._id.toString();
    if (userStr === req.user.id) {
      comment.isCommentMine = true;
    }
  });

  setTimeout(function () {
    //////console.log(post);    
    res.status(200).json({ success: true, data: post, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
  }, 1000)
});
exports.Highlight = asyncHandler(async (req, res, next) => {
  const post = await Post.find({ isPrivate: false, resolved: false }).sort({ commentsCount: -1 }).sort({ likesCount: -1 });
  //////console.log(post);
  res.status(200).json({ success: true, data: post, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
})
exports.reportComplain = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (post.isPrivate && !post.accessibility.includes(req.user.username)) {
    return next({
      message: "Access denied",
      statusCode: 401
    })
  }
  if (post.user._id.toString() === req.user.id) {
    return next({
      message: "HAHAHAHA!!DAMN Funny!Reporting your own post",
      statusCode: 401
    })
  }
  const report = await Report.findOne({ reporter: req.user.id, postId: req.params.id });
  if (!post.reportCount) {
    post.reportCount = 0;
  }
  if (report) {
    post.reportCount = post.reportCount - 1;
    await report.remove();//delete previous report filed by this user and replace it with new report
  }
  post.reportCount = post.reportCount + 1;
  if (post.reportCount > 15) {
    const noti = await Notification.create({ receiver: [post.user._id], sender: post.user._id, notifiedMessage: "We are sorry that your previous post was deleted because of a larger number of reports against your complaintpost", avatar: post.files[0] });
    await User.findByIdAndUpdate(post.user._id,{
      $push:{unseennotice:noti._id}
    });
    await Notification.deleteMany({ postId: post._id }, (err, res) => { });
    await Comment.deleteMany({ post: post._id }, (err, res) => { });
    this.postDelOp(post.user._id, post._id);
    await post.remove();
  }
  else {
    await post.save();
    await Report.create({ description: req.body.reportText, postId: req.params.id, reporter: req.user.id });
  }

  res.status(200).json({ success: true, data: {}, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });

})
exports.postDelOp = async function (id, pid) {
  await User.findByIdAndUpdate(id, {
    $inc: { postCount: -1 },
  });
  await Report.deleteMany({ postId: pid }, (err, res) => {
    console.log('reports cleared')
  })
  await User.find({}, {
    $pull: { posts: pid },
    $pull: { taggedComplaints: pid },
    
  });
  await User.find({},{
    $pull: { savedComplaints: pid },
  });

}
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }
  
  if (post.user._id.toString() !== req.user.id) {
    return next({
      message: "You are not authorized to delete this post",
      statusCode: 401,
    });
  }
  const allnoti = await Notification.find({ postId: req.params.id });
  console.log(allnoti);
  console.log('\n\n\n\n\n'+post.accessibility.concat([post.user._id]));
  for (noti of allnoti) {    
    for (i of noti.receiver) {
      await User.findByIdAndUpdate(post.user._id, {
        $pull: { unseennotice: noti._id }
      });
      await User.findOneAndUpdate({ username: i }, {
        $pull: { unseennotice: noti._id }
      })
    }
  }
  this.postDelOp(req.user.id, req.params.id);
  await Notification.deleteMany({ postId: req.params.id }, function (err, res) {
    //if(err)
    //////console.log(err);
  });
  await Comment.deleteMany({ post: req.params.id }, function (err, res) { });
  for (tag of post.tags) {
    const usermodel = await User.findOne({ username: tag });
    const index = await usermodel.taggedComplaints.indexOf(post._id);
    await usermodel.taggedComplaints.splice(index, 1);
    await usermodel.save();
  }

  await post.remove();

  res.status(200).json({ success: true, data: {}, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
});

exports.addPost = asyncHandler(async (req, res, next) => {
  const { caption, files, tags, isPrivate, accessibility } = req.body;
  const user = req.user.id;
  //////console.log(req.body);
  let post = await Post.create({ caption, files, tags, user, isPrivate, accessibility: accessibility.filter((u) => u != req.user.username) });
  await Notification.deleteMany({ receiver: [] }, (err, res) => { });
  if (isPrivate) {
    let receiver = accessibility.filter((tag) => { return tag != req.user.username });
    if (receiver.length > 0)
      noti = await Notification.create({ receiver: receiver, avatar: files[0], sender: user, postId: post._id, type: "newPost", url: `/p/${post._id}`, notifiedMessage: `${req.user.username} added a private complaint post and tagged you.Click to view it` });
    for (i of receiver) {
      await User.findOneAndUpdate({ username: i }, {
        $push: { unseennotice: noti._id }
      })
    }
  }
  //console
  else {
    let receiver = req.user.followers;
    if (receiver)
      receiver = receiver.concat(tags.filter((tag) => { return tag != req.user.username }));
    //////console.log(receiver);
    if (receiver.length > 0){
      noti = await Notification.create({ receiver: receiver, avatar: files[0], sender: user, postId: post._id, type: "newPost", url: `/p/${post._id}`, notifiedMessage: `${req.user.username} added a general complaint post.Click to view it` });
    for (i of receiver) {
      await User.findOneAndUpdate({ username: i }, {
        $push: { unseennotice: noti._id }
      })

      await User.findByIdAndUpdate(i, {
        $push: { unseennotice: noti._id }
      })
    }
  }
}

  await User.findByIdAndUpdate(req.user.id, {
    $push: { posts: post._id },
    $inc: { postCount: 1 },
  });
  for (tag of tags) {
    const usermodel = await User.findOne({ username: tag });
    await usermodel.taggedComplaints.push(post._id);
    await usermodel.save();
  }



  post = await post
    .populate({ path: "user", select: "avatar username fullname" })
    .execPopulate();

  res.status(200).json({ success: true, data: post, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
});

exports.toggleLike = asyncHandler(async (req, res, next) => {
  // make sure that the post exists
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (post.user.toString() != req.user.id && post.isPrivate && !post.accessibility.includes(req.user.username)) {
    return next({
      message: "You are not authorised to access this post",
      statusCode: 401,
    })
  }
  const noti_o = await Notification.findOne({ receiver: [post.user._id], sender: req.user.id, postId: post._id, type: "likedPost", notifiedMessage: `${req.user.username} liked your post` });
  const noti_2 = await Notification.findOne({sender: req.user.id, postId: post._id, notifiedMessage: `${req.user.username} liked the post in which you were tagged`})
  if (post.likes.includes(req.user.id)) {
    const index = post.likes.indexOf(req.user.id);
    post.likes.splice(index, 1);
    post.likesCount = post.likesCount - 1;
    if (req.user.id !== post.user._id.toString())
      await Notification.deleteOne({ receiver: [post.user._id], sender: req.user.id, postId: post._id, type: "likedPost", notifiedMessage: `${req.user.username} liked your post` }, function (err, res) { });
    await Notification.deleteOne({ sender: req.user.id, postId: post._id, type: "likedPost" }, function (err, res) { });
    if(noti_o){
      await User.findByIdAndUpdate(post.user._id,{
        $pull:{unseennotice:noti_o._id}
    });
  }
  if(noti_2){
    for(x of noti_2.receiver){
      await User.findOneAndUpdate({username:x},{
        $pull:{unseennotice:noti_2._id}
    });
    }
  }
    
    await post.save();
  } else {
    post.likes.push(req.user.id);
    post.likesCount = post.likesCount + 1;
    if (req.user.id !== post.user._id.toString()){
      const noti1 = await Notification.create({ receiver: [post.user._id], avatar: req.user.avatar, url: `/p/${post._id}`, type: "likedPost", sender: req.user.id, postId: post._id, notifiedMessage: `${req.user.username} liked your post` });
      await User.findByIdAndUpdate(post.user._id,{
        $push:{unseennotice:noti1._id}
      });
    }
    if (post.accessibility.length > 0){
     const noti = await Notification.create({ receiver: post.accessibility.filter((tag) => { return tag != req.user.username && tag != post.user.username }), avatar: req.user.avatar, url: `/p/${post._id}`, type: "likedPost", sender: req.user.id, postId: post._id, notifiedMessage: `${req.user.username} liked the post in which you were tagged` });
      for(x of noti.receiver){
        await User.findOneAndUpdate({username:x},{
          $push:{unseennotice:noti._id}
        });        
      }
    }
    await post.save();
  }

  res.status(200).json({ success: true, data: {}, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
});

exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: "user",
    select: "username"
  });

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }
  if (post.user.username != req.user.username && post.isPrivate && !post.accessibility.includes(req.user.username)) {
    return next({
      message: "You are not authorised to access this post",
      statusCode: 401,
    })
  }
  let comment = await Comment.create({
    user: req.user.id,
    post: req.params.id,
    text: req.body.text,
  });
  
  await Notification.deleteMany({ postId: post._id, notifiedMessage: `${req.user.username} commented on your post` }, (err, res) => { });
  await Notification.deleteMany({ postId: post._id, notifiedMessage: `${req.user.username} commented on a post you were tagged` }, (err, res) => { });
  if (req.user.id !== post.user._id.toString()) {
    const noti = await Notification.create({ receiver: [post.user._id], avatar: `${req.user.avatar}`, url: `/p/${post._id}/?commentId=${comment._id}`, commentId: comment._id, sender: req.user.id, postId: post._id, notifiedMessage: `${req.user.username} commented on your post` });
    await User.findOneAndUpdate({ username: post.user.username }, {      
      $push: { unseennotice: noti._id }
    });
  }
  if (post.accessibility.length > 0) {
    const notic = await Notification.create({ receiver: post.accessibility.filter((tag) => { return tag != req.user.username && tag != post.user.username }), avatar: `${req.user.avatar}`, url: `/p/${post._id}/?commentId=${comment._id}`, commentId: comment._id, sender: req.user.id, postId: post._id, notifiedMessage: `${req.user.username} commented on a post you were tagged` });
    for (x of notic.receiver) {      
      await User.findOneAndUpdate({ username: x }, {        
        $push: { unseennotice: notic._id }
      })
    }
  }
  post.comments.push(comment._id);
  post.commentsCount = post.commentsCount + 1;
  await post.save();

  comment = await comment
    .populate({ path: "user", select: "avatar username fullname" })
    .execPopulate();

  res.status(200).json({ success: true, data: comment, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (post.user.toString() != req.user.id && post.isPrivate && !post.accessibility.includes(req.user.username)) {
    return next({
      message: "You are not authorised to access this post",
      statusCode: 401,
    })
  }
  const comment = await Comment.findOne({
    _id: req.params.commentId,
  });
  const noti1 = await Notification.findOne({sender: req.user.id, postId: req.params.id,notifiedMessage: `${req.user.username} commented on a post you were tagged`});
  const noti2 = await Notification.findOne({sender: req.user.id, postId: req.params.id,notifiedMessage: `${req.user.username} commented on your post`});
  if(noti1){
  for(x of noti1.receiver){
    await User.findOneAndUpdate({username:x},{
      $pull:{unseennotice:noti1._id}
    })
  }
}
if(noti2){
  for(x of noti2.receiver){
    await User.findByIdAndUpdate(x,{
      $pull:{unseennotice:noti2._id}
    })
  }
}
  if (!comment) {
    return next({
      message: `No comment found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (comment.user.toString() !== req.user.id) {
    return next({
      message: "You are not authorized to delete this comment",
      statusCode: 401,
    });
  }
  await Notification.deleteMany({ sender: req.user.id, postId: req.params.id, commentId: req.params.commentId }, function (err, res) {
    //if(err)
    //////console.log(err);
  });

  // remove the comment from the post
  const index = post.comments.indexOf(comment._id);
  post.comments.splice(index, 1);
  post.commentsCount = post.commentsCount - 1;
  await post.save();

  await comment.remove();

  res.status(200).json({ success: true, data: {}, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
});

exports.searchPost = asyncHandler(async (req, res, next) => {
  if (!req.query.caption) {
    return next({
      message: "Enter the caption for post",
      statusCode: 400,
    });
  }

  let posts = [];

  if (req.query.caption) {
    const regex = new RegExp(req.query.caption, "i");
    posts = await Post.find({ caption: regex });
  }
  posts = posts.filter((post) => { return !post.isPrivate || post.accessibility.includes(req.user.username) })
  res.status(200).json({ success: true, data: posts, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
});
exports.resolveComplaint = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }
  if (post.user.toString() !== req.user.id) {
    return next({
      message: "You are not authorized to do this action",
      statusCode: 401,
    });
  }
  post.resolved = req.body.markresolved;
  await post.save();
  const noti = await Notification.findOne({ sender: req.user.id, postId: req.params.id, type: "Resolved" });
  if(noti){
  for (x of noti.receiver) {    
    await User.findOneAndUpdate({ username: x }, {
      $pull: { unseennotice: noti._id },      
    })
    await noti.remove();
    await Notification.deleteMany({sender: req.user.id, postId: req.params.id, type: "Resolved"},(err,res)=>{});
  }
}
let allfollower = [];
if(!post.isPrivate){
 for(i of req.user.followers){
   const user = await User.findById(i);
   if(user&&post.accessibility.indexOf(user.username)==-1){
     allfollower.push(user.username)
   }
 }
}
  const newnoti = await Notification.create({ sender: req.user.id, postId: req.params.id, type: "Resolved", avatar: post.files[0], receiver: !post.isPrivate ? allfollower.concat(post.accessibility) : post.accessibility, url: `/p/${req.params.id}`, notifiedMessage: `${req.user.username} marked a ${post.isPrivate ? "private" : "public"} complain as ${post.resolved ? "resolved" : "unresolved"}` });
  for(x of newnoti.receiver) {   
    await User.findOneAndUpdate({ username: x }, {      
      $push: { unseennotice: newnoti._id }
    })    
  }
  
  res.status(200).json({ success: true, data: {}, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });

})
exports.toggleSave = asyncHandler(async (req, res, next) => {
  // make sure that the post exists
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }
  //console.log(post);
  if (post.user.toString() != req.user.id && post.isPrivate && !post.accessibility.includes(req.user.username)) {
    return next({
      message: "You are not authorised to access this post",
      statusCode: 401,
    })
  }
  const { user } = req;

  if (user.savedComplaints.includes(req.params.id)) {
    //////console.log("removing saved complain");
    await User.findByIdAndUpdate(user.id, {
      $pull: { savedComplaints: req.params.id },
    });
  } else {
    //////console.log("saving complain");
    await User.findByIdAndUpdate(user.id, {
      $push: { savedComplaints: req.params.id },
    });
  }

  res.status(200).json({ success: true, data: {}, unseenmsg:[...new Set(req.user.unseenmsg)].length, unseennotice: req.user.unseennotice.length });
});
