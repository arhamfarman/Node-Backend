// const ErrorResponse = require('../utils/errorResponse')
// const asyncHandler = require('../middleware/async');
// const Bootcamp = require('../models/Bootcamps')

// const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamps');


//@desc    Get  ALL Bootcamps
//@route   GET /api/v1/bootcamps
//@access  Public
exports.getBootcamps = asyncHandler(async(req,res,next)=>{

        const bootcamp = await Bootcamp.find()

        res.status(200).json({success:true,count:bootcamp.length,data:bootcamp})

    
})
 

//@desc    Post a Bootcamp
//@route   Post /api/v1/bootcamps/:id
//@access  Public
exports.postBootcamps = asyncHandler(async (req,res,next)=>{
  
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
        success:true,
        data:bootcamp
    })
   
})



// @desc    Get  Single Bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getOneBootcamps = asyncHandler(async(req,res,next)=>{
        const bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp){ 
         return   next(new ErrorResponse(`Bootcamp not found with he id of ${req.params.id}`,404))
        }
        res.status(200).json({success:true,data:bootcamp})   
    })






//@desc    Update a Bootcamp
//@route   PUT /api/v1/bootcamps/:id
//@access  Public
exports.updateBootcamps = asyncHandler(async(req,res,next)=>{
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
    
        if(!bootcamp){
            // return res.status(400).json({success:false})
            return   next(new ErrorResponse(`Bootcamp not found with he id of ${req.params.id}`,404))
        }
        
    res.status(200).json({success:true,data:bootcamp})
})


//@desc    Delete  ALL Bootcamps
//@route   DELETE /api/v1/bootcamps/:id
//@access  Public
exports.deleteBootcamps = asyncHandler(async(req,res,next)=>{
   
       const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)
       
       if(!bootcamp){
           return res.status(400).json({success:false})
       }
       res.status(200).json({success:true,data:bootcamp})

})