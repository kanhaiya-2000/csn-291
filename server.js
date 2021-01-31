require("dotenv").config();
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const user = require("./routes/user");
const helmet = require('helmet');
const Chat = require("./models/Chat");
const Message = require('./models/Message');
const User = require("./models/User");
const complain = require("./routes/complain");
const chat = require("./routes/chat");
const db = require("./utils/db.config");
const errorHandler = require("./middleware/errorhandle");
const app = express();
var si ={};
db();
app.use(express.json());
app.use(cors());
app.use(helmet.frameguard({ action: 'DENY' }));
app.use(function (req, res, next) {
  if (process.env.NODE_ENV === "production")
    res.setHeader('Access-Control-Allow-Origin', 'https://complaintlodger.herokuapp.com')
  if ((req.get('X-Forwarded-Proto') !== 'https' && process.env.NODE_ENV == "production")) {
    res.redirect('https://' + req.get('Host') + req.url);
  } else
    next();
});

app.use("/auth", auth);//login or signup route
app.use("/user", user);
//keep collections for private and public complains as different considering security

//commenting out this part since this has already been implemented in controller part
//app.use('/:id/private',privateComplain);//req.params.id
app.use("/complain", complain);
app.use('/chat', chat);

app.use(errorHandler);
if (process.env.NODE_ENV == "production") {
  app.use(express.static('client/build'));
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'), { lastModified: false });
  })
}
const PORT = process.env.PORT || 55000;
const server = app.listen(
  PORT,
  console.log(`server started in ${process.env.NODE_ENV} mode at port ${PORT}`)
);
async function clearSocketId() {
  let alluser = await User.find({});
  //console.log(alluser);
  for (userg of alluser) {
    userg.socketId = [];
    if(!userg.tempid){
      userg.tempid = 232424425252533;
    }
    await userg.save();
  }
  console.log('\n\n\n\n\n\n\n', alluser);
}


const io = require("socket.io")(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cors: {
    origin: process.env.NODE_ENV == 'production' ? 'https://complaintlodger.herokuapp.com' : '*',
  }
});
const jwt = require('jsonwebtoken');
io.use(async (socket, next) => {
  try {
    if (socket.handshake.query.token) {
      const decoded = await jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET);
      socket.uid = decoded.id;
      socket.tempid = decoded.tempid;
      next();
    }
  }
  catch (err) {
    //console.log("socket connection failed " + err.message);
  }
});
io.on("connection", async function (socket) {
  console.log(socket.uid + " connected!");
  //clearSocketId();
  ////console.log(typeof(socket.id));
  await User.findOneAndUpdate({ _id: socket.uid, tempid: socket.tempid }, {
    $push: { socketId: socket.id }
  });
  socket.on('joinroom', function (room) {
    socket.join(room);
    //console.log(socket.uid + " joined " + room);
  })
  
  //------------------------------------  MAIN_SOCKET_PART -----------------------
  socket.on('requestverification', async function (data) {
    const userit = await User.findById(socket.uid);
    if (userit.tempid != socket.tempid) {
      socket.emit('errormsg', "Please login again");
      return;
    }
    const ifnew = await Chat.findOne({ name: data }).populate({
      path: "participants",
      select: "avatar username socketId"
    }).populate({
      path: "messages",
      select: "createdAt text"
    });
    //console.log("ifnew", ifnew);
    if (ifnew && ifnew.participants.toString().includes(socket.uid) && userit) {
      for (i of userit.socketId)
        io.to(i).emit('addnewlist', { avatar: ifnew.participants.filter((user) => user._id.toString() != socket.uid)[0].avatar, username: ifnew.participants.filter((user) => user._id.toString() != socket.uid)[0].username, lastmessage: ifnew.messages[ifnew.messages.length - 1].text, timeSince: ifnew.messages[ifnew.messages.length - 1].createdAt, uri: "/chat/t/" + data, id: ifnew._id });
      //console.log('request verified for room ' + data);
    }
  })
  socket.on('connect', async function () {
    await User.findOneAndUpdate({ _id: socket.uid, tempid: socket.tempid }, {
      $push: { socketId: socket.id }
    });
  })
  socket.on('read', async function (data) {
    const userdetail = await Chat.findOne({ name: data }).populate({
      path: "participants",
      select: "unseenmsg socketId username",
    }).populate({
      path: "messages",
      select: "owner"
    });
    if (!userdetail.participants.toString().includes(socket.uid)) {
      return;
    }
    const curruser = await User.findById(socket.uid);
    const otheruser = userdetail.participants.filter(function (a) {
      return a._id.toString() != socket.uid
    })
    // //console.log('otheruser-->',otheruser);
    for (i in curruser.unseenmsg) {
      // //console.log(curruser,data);
      if (curruser.unseenmsg[i] == data) {
        curruser.unseenmsg.splice(i, 1);
      }

    }
    await curruser.save();
    for (i of curruser.socketId) {
      io.to(i).emit('updatestate', { length: [... new Set(curruser.unseenmsg)].length, data: data })
    }
    let status = false;
    if (userdetail.messages.length > 1)
      status = userdetail.messages[userdetail.messages.length - 1].owner.toString() === socket.uid && otheruser[0].unseenmsg.indexOf(data) == -1
    for (i of otheruser[0].socketId) {
      io.to(i).emit('readmsg', status);
    }

  })
  socket.on('msg', async function (data) {

    const userdetail = await Chat.findOne({ name: data.roomid }).populate({
      path: "participants",
      select: "socketId avatar fullname unseenmsg",
    });

    ////console.log("detail\n\n\n"+userdetail);
    const user = await User.findById(socket.uid);
    if (user.tempid != socket.tempid) {
      socket.emit('errormsg', "Please login again");
      return;
    }
    if (!userdetail || !userdetail.participants.toString().includes(socket.uid) || !user) {
      //socket.emit("deletelast");
      return;
    }
    const otheruser = userdetail.participants.filter(function (a) {
      return a._id.toString() != socket.uid
    })[0];
    otheruser.unseenmsg.push(data.roomid);
    await otheruser.save();
    for (i of otheruser.socketId) {
      io.to(i).emit('updatestate', { length: [... new Set(otheruser.unseenmsg)].length, data: data.roomid })
    }
    if (user.socketId.indexOf(socket.id) == -1)
      user.socketId.push(socket.id);
    //console.log(socket.id);
    await user.save();
    const message = await Message.create({ owner: user._id, text: data.message, roomid: data.roomid });
    await Chat.findOneAndUpdate({ name: data.roomid }, {
      $push: { messages: message._id }
    });
    const fullname = userdetail.participants.filter((u) => u._id.toString() === socket.uid)[0].fullname
    for (x of userdetail.participants) {
      for (i of x.socketId)
        io.to(i).emit("msg", { createdAt: message.createdAt, roomid: data.roomid, text: message.text, isMine: message.owner.toString() == x._id.toString(), _id: message._id.toString(), sender: fullname, chatRoomid: userdetail._id.toString() })
    }
    userdetail.lastupdated = Date.now();
    await userdetail.save();

  })
  socket.on('delete', async function (data) {
    const user = await User.findById(socket.uid);
    if (!user)
      return;
    if (user.tempid != socket.tempid) {
      socket.emit('errormsg', "Please login again");
      return;
    }
    if (user.socketId.indexOf(socket.id) == -1)
      user.socketId.push(socket.id);
    await user.save();
    const message = await Message.findById(data.msgId);
    const users = await Chat.findOne({ name: data.roomid }).populate({
      path: "participants",
      select: "socketId unseenmsg"
    });

    const otheruser = users.participants.filter(function (a) {
      return a._id.toString() != socket.uid
    })[0];
    otheruser.unseenmsg.splice(otheruser.unseenmsg.indexOf(data.roomid), 1);
    await otheruser.save();
    //console.log("socketid", socket.id);
    if (!message || !users || !user) {
      socket.emit('errormsg', "No msg found");
      return;
    }

    if (message.owner.toString() != socket.uid) {
      socket.emit("errormsg", "You are not authorised to delete this message");
      return;
    }
    await Chat.findOneAndUpdate({ name: data.roomid }, {
      $pull: { messages: data.msgId }
    });
    await message.remove();
    for (x of users.participants) {
      for (i of x.socketId)
        io.to(i).emit('deletingmsg', { msgId: data.msgId });
      //socket.emit('deletingmsg',{msgId:data.msgId});
    }
    // //console.log(data);
  })
  socket.on('noticeseen', async (id) => {
    const user = await User.findById(socket.uid);
    user.unseennotice = [];
    await user.save();
  })
  socket.on('disconnect', async function () {
    await User.findOneAndUpdate({ _id: socket.uid }, {
      $pull: { socketId: socket.id }
    });
    console.log(socket.id + ' disconnected ' + socket.uid);
  })
  //-------------------------------- HANDLE CALL REQUEST-------------------------------
  
  socket.on('startcall',async function(data){
    if(si[data.from+"_"+data.to])
       return;
    console.log("call started",data);
    let from = await User.findById(data.from);
    let to = await User.findById(data.to);
    ////console.log("startcall ",data);
    if(!to||!from){
      socket.emit('err');
      console.log("return");
      return;
    }
    
    si[data.from+"*"+data.to] = 0;
    si[data.from+"r"+data.to] =  false;
    si[data.from+"_"+data.to] =  setInterval(async function(){
      si[data.from+"*"+data.to]++;
      to = await User.findById(data.to);
      if(si[data.from+"*"+data.to]>20){
        clearInterval(si[data.from+"_"+data.to]);
        si[data.from+"_"+data.to] = null;
        si[data.from+"*"+data.to] = null;
        socket.emit('noresponse');
        for(let i of to.socketId){
          io.to(i).emit('removecallingmodel');
        }
        
      }
      else{
        console.log(si);
        if(!si[data.from+"r"+data.to])
        for(let i of to.socketId){
          console.log("send ",i);
          io.to(i).emit('getcallrequest',{video:data.video,from:from.fullname,avatar:from.avatar,fromid:data.from,toid:data.to,fromsocketId:socket.id})
        }
      }
      
    },1500);
    ////console.log(si);
  })
  socket.on('confirmation',async function(data){ 
    ////console.log(si);  
    
    if(si[data.from+"*"+data.to]>1)
      return;
      //console.log("t");
    const from = await User.findById(data.from);
    ////console.log(from);
    for(const i of from.socketId){
      io.to(i).emit('receivedresponse',data.to);
    }
  });
  socket.on("callaborted",async function(data){
    const to = await User.findById(data.to);
    if(!to){
      return;
    }
    console.log(data);
    si[data.from+"_"+data.to]&&clearInterval(si[data.from+"_"+data.to]);
    si[data.from+"_"+data.to] = null;
    si[data.from+"*"+data.to] = null;    
    for(const t of to.socketId){
      io.to(t).emit('removecallingmodel');
      io.to(t).emit('failedcall');
      setTimeout(function(){
        io.to(t).emit('removecallingmodel');
      },1000);
    }
  })
  socket.on("changesocketid",async function(data){
    let to = await User.findById(data.to);
    if(!to){
      return;
    }
    for(let i of to.socketId){
      io.to(i).emit("changesocketid",{newid:socket.id,uid:data.from});
    }
  })
  socket.on('callresponse',async function(data){
    //console.log("callresponse ",data);
    const from = await User.findById(data.from);
    const to = await User.findById(data.to);
    if(!to||!from){      
      return;
    }
    if(data.rejected){ 
      //console.log(from);
      si[data.from+"r"+data.to] = true;       
      for(const i of from.socketId){              
        io.to(i).emit('callrejected',data.to)
      }      
    }
    // else{
    //   for(const i of from.socketId){
    //     data.id = socket.id;
    //     io.to(i).emit('sdp',data);
    //   }
    // }
    clearInterval(si[data.from+"_"+data.to]);
    si[data.from+"_"+data.to] = null;
    si[data.from+"*"+data.to] = null;
    for(const i of to.socketId){
      io.to(i).emit('removecallingmodel');
      setTimeout(function(){
        io.to(i).emit('removecallingmodel');
      },1000);
    }
  })
  socket.on("sdp",function(data){    
    data.id = socket.id;
    console.log("sdp-data",data.target);
    io.to(data.target).emit("sdp",data);
  })
  socket.on("endcall",async function(data){
    const to = await User.findById(data.to);
    const from = await User.findById(data.from);
    if(!to||!from){
      return;
    }
    for(const i of to.socketId){
      io.to(i).emit("endcall",data);
    }
  });
  socket.on("micaction",async function(data){
    console.log("mic ",data);
    const to = await User.findById(data.to);
    for(const i of to.socketId){
      io.to(i).emit("micaction",data);
    }
  })
  socket.on("candidate",function(data){
    data.id = socket.id;
    console.log("candidate-data",data.target);
    io.to(data.target).emit("candidate",data);
  })
  socket.on("answer",function(data){
    data.id = socket.id;
    console.log("answer-data",data.target);
    io.to(data.target).emit("answer",data);
  })
})
