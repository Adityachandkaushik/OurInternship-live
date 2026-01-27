import mongoose from "mongoose";
const  userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
      password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['student','admin'],
        required:true
    }},
   {timestamps:true});
export const User = mongoose.model('User',userSchema);
