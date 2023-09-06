const mongoose = require("mongoose");
 
const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      
    },
    contactNumber: {
      type: Number,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    street: {
      type: String,
      
    },
    city: {
      type: String,
      
    },
    state: {
      type: String,
      
    },
    pin: {
      type: Number,
      
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
    },
    isBlocked:{
      type:Boolean,
      default:false  
    },
    isVerified:{
      type:Number,
      default:0  
    }
  });

const userModel=mongoose.model("users",userSchema)

module.exports=userModel