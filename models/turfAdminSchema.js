const mongoose = require("mongoose");
 
const turfAdminSchema = new mongoose.Schema({
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
    city: {
      type: String,
      
    },
    pin: {
      type: Number,
      
    },
    password: {
      type: String,
      required: true
    },
    isVerified: {
      type: Number,
      default:0
    }
  });

const turfAdminModel=mongoose.model("turfAdmin",turfAdminSchema)

module.exports=turfAdminModel