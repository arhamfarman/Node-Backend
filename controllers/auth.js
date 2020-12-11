const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User= require('../models/Users');
const { unsubscribe } = require('../routes/auth');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto')


//@desc    Register User
//@route   POST /api/v1/auth/register
//@access  Public

exports.register = asyncHandler(async(req,res,next)=>{

    const{name,email,password,role}= req.body

    //Create User

const user = await User.create({
    name,
    email,
    password,
    role
})

    sendTokenResponse(user,200,res)
})


//@desc    Login User
//@route   POST /api/v1/auth/Login
//@access  Public

exports.login = asyncHandler(async(req,res,next)=>{

    const{email,password}= req.body

    //Validate email and password
    if(!email||!password){
        return next(new ErrorResponse('Please provide an email and a password', 400))
    }

    //Check for the user

    const user = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorResponse('Invalid email or password', 401))
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password)

    if(!isMatch){
        return next(new ErrorResponse('Invalid email or password', 401))
    }

    sendTokenResponse(user,200,res)
})


//@desc    Get current logged in user
//@route   POST /api/v1/auth/Login
//@access  Private

exports.getMe = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        data:user
    })
})


//@desc    Forgot Password
//@route   POST /api/v1/auth/forgotpassword
//@access  Public

exports.forgotPassword = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email })

    if(!user){
        return next(new ErrorResponse('Theres no user with that email', 404))
    }

    //Get reset token

    const resetToken = user.getResetPasswordToken()

    await user.save({validateBeforeSave:false})

    // Create reset URL
    const resetURL  = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`
        
    const message = `Ypu are reciveing this email because you(or someone else)
    has requested the reset of a password. Please make a PUT request 
    to: \n\n${resetURL}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Passwod reset token',
            message
        })

        res.status(200).json({success:true, data: 'Email sent'})
    } catch (err) {
        console.log(err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire= undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorResponse('Email could not be sent', 500))
    }

    res.status(200).json({
        success:true,
        data:user
    })
})

//@desc    Reset Password 
//@route   PUT /api/v1/auth/resetPassword/:resetoken
//@access  Private

exports.resetPassword = asyncHandler(async(req,res,next)=>{
    //Get hashed token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex')


    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt: Date.now() }
    })
    if(!user){
        return next(new ErrorResponse('Invalid token', 400))
    }

    //Set the new password
     user.password = req.body.password
     user.resetPasswordToken=undefined
     user.resetPasswordExpire=undefined
     await user.save()

    res.status(200).json({
        success:true,
        data:user
    })
})



//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res)=>{
    //Create Token
    const token = user.getSignedJwtTokens()

    const options = {
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    }
    if (process.env.NODE_ENV==='production') {
        options.secure=true
    }
    res
    .status(statusCode)
    .cookie('token', token,options)
    .json({
        success:true,
        token
    })
}
