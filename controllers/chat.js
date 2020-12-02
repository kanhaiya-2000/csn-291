const User = require("../models/User");
const asyncHandler = require("../middleware/asynchandler");
const Chat = require("../models/Chat");

exports.getConversationDetail = asyncHandler(async (req, res, next) => {
    
    const chatroom = await Chat.findOne({name:req.params.roomid}).populate({
        path:"messages",
        select:"owner createdAt text"
    }).populate({
        path:"participants",
        select:"avatar username fullname bio"
    });
    if(!chatroom){
        return next({
            statusCode:404,
            message:"Requested conversation could not be fetched"
        })
    }
    if(!chatroom.participants.toString().includes(req.user.id)){
        return next({            
            statusCode:401,
            message:"Requested conversation could not be fetched"
        })
    }
    const messages = [];
    chatroom.messages.forEach(msg=>{
        messages.push({text:msg.text,isMine:msg.isMine = req.user.id===msg.owner.toString(),_id:msg._id,createdAt:msg.createdAt});
    })
    const otheruser = chatroom.participants.filter(function(user){
        return user._id.toString()!=req.user.id
    })
   // console.log(messages);
    res.status(200).json({success:true,messages:messages,user:otheruser[0]});

});
exports.receiveUser = asyncHandler(async(req,res,next)=>{
    let users = await User.find({}).select("avatar username fullname").lean().exec();
    users = users.filter(function(user){
       return user._id!=req.user.id
    })
    res.status(200).json({sucess:true,data:users});
});
exports.createNew = asyncHandler(async(req,res,next)=>{
    const otheruser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    const checkifexist = await Chat.findOne({name:currentUser._id.toString()+"_"+otheruser._id.toString()})||await Chat.findOne({name:otheruser._id.toString()+"_"+currentUser._id.toString()});
    if(!otheruser){
        return next({
            statusCode:400,
            message:"No record available for other participant"
        })
    }
    if(checkifexist){
        res.status(200).json({success:true,uri:`/chat/t/${checkifexist.name}`})
    }
    else{
    
    await Chat.create({participants:[currentUser._id,otheruser._id],name:req.user.id+"_"+req.params.id}).then(()=>res.status(200).json({success:true,uri:`/chat/t/${req.user.id+"_"+req.params.id}`})).catch(err=>next({
        statusCode:"400",
        message:err.message
    }));
}
        
});
exports.filterUser = asyncHandler(async(req,res,next)=>{
    const text = req.params.text;
    let users = await User.find({}).select("avatar username fullname").lean().exec();    
    
    users = users.filter(function(user){
        return user._id!=req.user.id&&(user.fullname.toLowerCase().includes(text)||user.username.toLowerCase().includes(text));
    })
    res.status(200).json({sucess:true,data:users});
})
