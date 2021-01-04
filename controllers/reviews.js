const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');


//@route   GET Reviews for a single bootcamp
//@route   GET /api/v1/reviews
//@route   GET /api/v1/bootcamps/:bootcampId/reviews
//@access  Public

exports.getReviews = asyncHandler(async(req,res,next)=>{
    let query;

    if(req.params.bootcampID){
        query  = Review.find({bootcamp: req.params.bootcampID})
    }else{
        query = Review.find().populate({
            path:'bootcamp',
            select: 'name description'
        })
    }

    const reviews = await query

     res.status(200).json({
         success:true,
         count:reviews.length,
         data:reviews
     })
})