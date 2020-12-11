const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Courses');
const Bootcamp = require('../models/Bootcamps');




//@desc    Get  ALL Courses
//@route   GET /api/v1/courses
//@route   GET /api/v1/bootcamps/:bootcampId/courses
//@access  Public

exports.getCourses = asyncHandler(async(req,res,next)=>{
    let query;

    if(req.params.bootcampID){
        query  = Course.find({bootcamp: req.params.bootcampID})
    }else{
        query = Course.find().populate({
            path:'bootcamp',
            select: 'name description'
        })
    }

    const courses = await query

     res.status(200).json({
         success:true,
         count:courses.length,
         data:courses
     })
})


//@desc    Get  Single Course
//@route   GET /api/v1/courses/:id
//@access Public

exports.getOneCourse = asyncHandler(async(req,res,next)=>{
   const course = await Course.findById(req.params.id).populate({
       path:'bootcamp',
       select:'name description'
   })

   if(!course){
       return next(new ErrorResponse(`No course with the id of ${req.params.id}`,404))
   }
     res.status(200).json({
         success:true,
         data:course
     })
})

//@desc    Add a course
//@route   POST /api/v1/bootcamps/:bootcampId/courses
//@access Private

exports.addCourse = asyncHandler(async(req,res,next)=>{
    
    req.body.bootcamp = req.params.bootcampID;
    req.body.user = req.user.id;
    
    const bootcamp = await Bootcamp.findById(req.params.bootcampID)
 
    if (!bootcamp) {
        return next(
          new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampID}`),
          404
        );
      }

       //Make sure user is the course owner
       if(bootcamp.user.toString()!==req.user.id&& req.user.role!=='admin'){
        return next(
            new ErrorResponse(`User with he id of ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,401)
        )
    }
 
    const course = await Course.create(req.body)
      res.status(200).json({
          success:true,
          data:course
      })
 })


 //@desc    Update a course
//@route   PUT /api/v1/courses/:id
//@access Private

exports.updateCourse = asyncHandler(async(req,res,next)=>{
    
    let course = await Course.findById(req.params.id)
 
    if (!course) {
        return next(
          new ErrorResponse(`No course found with the id of ${req.params.bootcampID}`),
          404
        );
      }
        //Make sure user is the course owner
        if(bootcamp.user.toString()!==req.user.id&& req.user.role!=='admin'){
            return next(
                new ErrorResponse(`User with he id of ${req.user.id} is not authorized to update the course ${course._id}`,401)
            )
        }
     course = await Course.findByIdAndUpdate(req.params.id, req.body,{
         new:true,
         runValidators:true
     })
      res.status(200).json({
          success:true,
          data:course
      })
 })


 //@desc    Delete a course
//@route   PUT /api/v1/courses/:id
//@access Private

exports.deleteCourse = asyncHandler(async(req,res,next)=>{
    
    const course = await Course.findById(req.params.id)
 
    if (!course) {
        return next(
          new ErrorResponse(`No course found with the id of ${req.params.bootcampID}`),
          404
        );
      }
        //Make sure user is the course owner
        if(bootcamp.user.toString()!==req.user.id&& req.user.role!=='admin'){
            return next(
                new ErrorResponse(`User with he id of ${req.user.id} is not authorized to delete the course ${course._id}`,401)
            )
        }
   await course.remove()
      res.status(200).json({
          success:true,
          data:{}
      })
 })
