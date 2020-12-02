const mongoose =  require("mongoose");

const NotifSchema = new mongoose.Schema({
    receiver:{
        type:[String],        
        required:true,
    },
    url:{
        type:String
    },
    postId:{
        type:mongoose.Schema.ObjectId,
        
    },
    commentId:{
        type:mongoose.Schema.ObjectId
    },
    sender:{
        type: String,
        required: true
    },
    avatar:{
        type:String        
    },
    notifiedMessage:{
        type:String,
        required: true,
        trim: true,
    },
    type:{
        type:String
    },
    createdAt:{
        type:Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Notification", NotifSchema);