const path = require('path')
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamps');



//@desc    Get  ALL Bootcamps
//@route   GET /api/v1/bootcamps
//@access  Public
exports.getBootcamps = asyncHandler(async(req,res,next)=>{

        let query
        const reqQuery = {...req.query};

        // Create query string
        let queryStr = JSON.stringify(reqQuery)

        //Fields to exclude
        const removeFields = ['select','sort','page','limit']

        //Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param=>delete reqQuery[param])

        console.log(reqQuery)
        //Create operatore=s ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`)

        //Finding resource
        query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

        //SELECT FIELDS
         if(req.query.select){
             const fields = req.query.select.split(',').join(' ')
             query = query.select(fields)
         }
         //Sort
         if(req.query.sort){
             const fields = req.query.sort.split(',').join(' ')
             query = query.sort(sortBy)
         }else{
             query = query.sort('-createdAt')
         }

         //Pagination

         const page = parseInt(req.query.page,10)||1;
         const limit = parseInt(req.query.limit,10)||100
         const skip = (page-1)*limit

         query = query.skip(skip).limit(limit)

        //Executing query
        
        const bootcamp = await query

        res.status(200).json({success:true,count:bootcamp.length,data:bootcamp})
})
 

//@desc    Post a Bootcamp
//@route   Post /api/v1/bootcamps/
//@access  Public
exports.postBootcamps = asyncHandler(async (req,res,next)=>{

    //Add user to req.body
    req.body.user = req.user.id
    //Check for published bootcamps
    const publishedBootcamps = await Bootcamp.findOne({user:req.user.id})

    //If the user is not an admsin, they can only add one bootcamp
    if(publishedBootcamps && req.user.role!=='admin'){
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already 
        published a bootcamp`, 400))
    }
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
        let bootcamp = await Bootcamp.findById(req.params.id)
    
        if(!bootcamp){
            // return res.status(400).json({success:false})
            return   next(new ErrorResponse(`Bootcamp not found with he id of ${req.params.id}`,404))
        }
        
    //Make sure user is the bootcamp owner
    if(bootcamp.user.toString()!==req.user.id&& req.user.role!=='admin'){
        return next(
            new ErrorResponse(`User with he id of ${req.params.id} is not authorized to update the bootcamp`,401)
        )
    }

    bootcamp = await Bootcamp.findOneAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators:true
    })
    res.status(200).json({success:true,data:bootcamp})
})

     
 


//@desc    Delete  ALL Bootcamps
//@route   DELETE /api/v1/bootcamps/:id
//@access  Public
exports.deleteBootcamps = asyncHandler(async(req,res,next)=>{
   
       const bootcamp = await Bootcamp.findById(req.params.id)
       
       if(!bootcamp){
           return res.status(400).json({success:false})
       }

       //Make sure user is the bootcamp owner
       if(bootcamp.user.toString()!==req.user.id&& req.user.role!=='admin'){
        return next(
            new ErrorResponse(`User with he id of ${req.params.id} is not authorized to delete the bootcamp`
            ,401)
        )
    }
       bootcamp.remove()
       res.status(200).json({success:true,data:bootcamp})

})

//@desc    Upload photo for bootcamp
//@route   DELETE /api/v1/bootcamps/:id/photo
//@access  Private
exports.bootcampPhotoUpload= asyncHandler(async(req,res,next)=>{
   
    const bootcamp = await Bootcamp.findById(req.params.id)
    
    if(!bootcamp){
        return   next(new ErrorResponse(`Bootcamp not found with he id of ${req.params.id}`,404))
    }

       //Make sure user is the bootcamp owner
       if(bootcamp.user.toString()!==req.user.id&& req.user.role!=='admin'){
        return next(
            new ErrorResponse(`User with he id of ${req.params.id} is not authorized to update the bootcamp`,401)
        )
    }


    if(!req.files){
        return   next(new ErrorResponse(`Please upload files`,400))
    }

    console.log(req.files)
    const file = req.files.file

    //Making sure that image is a photo
    if(!file.mimetype.startsWith('image')){
        return   next(new ErrorResponse(`Please upload an image file`,400))
    }

    //Check file size
    if(file.size>process.env.MAX_FILE_UPLOAD){
        return   next(
            new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,400))
    }

    //Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
        if(err){
            console.error(err)
            new ErrorResponse(`Problem with file upoad ${process.env.MAX_FILE_UPLOAD}`,500)
        }

        await Bootcamp.findByIdAndUpdate(req.params.id,{photo:file.name})

        res.status(200).json({
            success:true,
            data:file.name
        })
    })
})

