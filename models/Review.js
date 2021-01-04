const mongoose = require('mongoose');

const ReviewScehma = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        required: [true, 'Please add a title for Review'],
        maxlength:100
    },
    text:{
        type:String,
        required: [true,'Please add a review']
    },
    rating:{
        type:Number,
        min:1,
        max:10,
        required: [true,'Please rate it from 1-10']
    },
    
    createdAt:{
        type:Date,
        default: Date.now
    },
    bootcamp:{
        type:mongoose.Schema.ObjectId,
        ref:'Bootcamp',
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'user',
        required:true
    }
})


module.exports=  mongoose.model('Review', ReviewScehma)