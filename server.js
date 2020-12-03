require("dotenv").config();
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const user = require("./routes/user");
const Chat = require("./models/Chat");
const Message = require('./models/Message');
const User = require("./models/User");
const complain = require("./routes/complain");
const chat = require("./routes/chat");
const db = require("./utils/db.config");
const errorHandler = require("./middleware/errorhandle");
const app = express();
db();
app.use(express.json());
app.use(cors());
app.use(function(req, res, next) {
  //res.setHeader('Access-Control-Allow-Origin','http://localhost:3000/')
  if ((req.get('X-Forwarded-Proto') !== 'https'&&process.env.NODE_ENV=="production")) {
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
app.use('/chat',chat);

app.use(errorHandler);
if(process.env.NODE_ENV=="production"){
  app.use(express.static('client/build'));
  const path = require('path');
  app.get('*',(req,res)=>{    
      res.sendFile(path.resolve(__dirname,'client','build','index.html'));  	
  })
}
const PORT = process.env.PORT || 55000;
const server = app.listen(
  PORT,
  console.log(`server started in ${process.env.NODE_ENV} mode at port ${PORT}`)
);
const io = require("socket.io")(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cors: {
    origin: '*',
  }});
const jwt = require('jsonwebtoken');
io.use(async(socket,next)=>{
try{
  const decoded = await jwt.verify(socket.handshake.query.token,process.env.JWT_SECRET);
  socket.uid = decoded.id;
  socket.tempid = decoded.tempid;
  next();

}
catch(err){
  console.log("socket connection failed "+err.message);
}
});
io.on("connection",async function(socket){
  console.log(socket.uid+" connected!");
  //console.log(typeof(socket.id));
  await User.findOneAndUpdate({_id:socket.uid,tempid:socket.tempid},{
    $push:{socketId:socket.id}
  });
  socket.on('joinroom',function(room){
    socket.join(room);
    console.log(socket.uid+" joined "+room);
  })
  socket.on('requestverification',async function(data){
    const userit = await User.findById(socket.uid);
    if(userit.tempid!=socket.tempid){
      socket.emit('errormsg',"Please login again");
      return;
    }
    const ifnew = await Chat.findOne({name:data}).populate({
      path:"participants",
    select:"avatar username socketId"
  }).populate({
    path:"messages",
    select:"createdAt text"
  });
  console.log("ifnew",ifnew);
  if(ifnew&&ifnew.participants.toString().includes(socket.uid)&&userit){
    for(i of userit.socketId)
    io.to(i).emit('addnewlist',{avatar:ifnew.participants.filter((user)=>user._id.toString()!=socket.uid)[0].avatar,username:ifnew.participants.filter((user)=>user._id.toString()!=socket.uid)[0].username,lastmessage:ifnew.messages[ifnew.messages.length-1].text,timeSince:ifnew.messages[ifnew.messages.length-1].createdAt,uri:"/chat/t/"+data,id:ifnew._id});
    console.log('request verified for room '+data);
  }
  })
  socket.on('connect',async function(){
    await User.findOneAndUpdate({_id:socket.uid,tempid:socket.tempid},{
     $push:{socketId:socket.id}
    });
  })
  socket.on('msg',async function(data){    
    
    const userdetail = await Chat.findOne({name:data.roomid}).populate({
      path: "participants",
      select: "socketId avatar fullname",
    });
    //console.log("detail\n\n\n"+userdetail);
    const user = await User.findById(socket.uid);
    if(user.tempid!=socket.tempid){
      socket.emit('errormsg',"Please login again");
      return;
    }
    if(!userdetail||!userdetail.participants.toString().includes(socket.uid)||!user){
      //socket.emit("deletelast");
      return;
    }
    if(user.socketId.indexOf(socket.id)==-1)
      user.socketId.push(socket.id);
    console.log(socket.id);
    await user.save();
    const message = await Message.create({owner:user._id,text:data.message,roomid:data.roomid});
    await Chat.findOneAndUpdate({name:data.roomid},{
      $push:{messages:message._id}     
    });
    const fullname = userdetail.participants.filter((u)=>u._id.toString()===socket.uid)[0].fullname
        for(x of userdetail.participants){ 
          for(i of x.socketId)         
        io.to(i).emit("msg",{createdAt:message.createdAt,roomid:data.roomid,text:message.text,isMine:message.owner.toString()==x._id.toString(),_id:message._id.toString(),sender:fullname})
        }        
        userdetail.lastupdated = Date.now();
        await userdetail.save();      
    
  })
  socket.on('delete',async function(data){
    const user = await User.findById(socket.uid);
    if(!user)
       return;
    if(user.tempid!=socket.tempid){
        socket.emit('errormsg',"Please login again");
        return;
      }
    if(user.socketId.indexOf(socket.id)==-1)
      user.socketId.push(socket.id);
    await user.save();    
    const message = await Message.findById(data.msgId);
    const users = await Chat.findOne({name:data.roomid}).populate({
      path:"participants",
      select:"socketId"
    });
    
    console.log(users);
    console.log("socketid",socket.id);
    if(!message||!users||!user){
      socket.emit('errormsg',"No msg found");
      return;
    }
   
    if(message.owner.toString()!=socket.uid){
      socket.emit("errormsg","You are not authorised to delete this message");
      return;
    }
    await Chat.findOneAndUpdate({name:data.roomid},{
      $pull:{messages:data.msgId}
    });
    await message.remove();
    for(x of users.participants){
      for(i of x.socketId)
      io.to(i).emit('deletingmsg',{msgId:data.msgId});
      //socket.emit('deletingmsg',{msgId:data.msgId});
    }
   // console.log(data);
  })
  socket.on('disconnect',async function(){
    await User.findOneAndUpdate({_id:socket.uid},{
      $pull:{socketId:socket.id}
     });   
    console.log(socket.id+'disconnected '+socket.uid);
  })
})
