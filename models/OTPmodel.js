const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
    OTP:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    type:{
        type:String
    },
    expires:{
        type:Date,
        required:true
    }
});
OTPSchema.methods.getExpiry = async function(){
  return this.expires - Date.now() ;
}
module.exports = mongoose.model("OTPmodel",OTPSchema);