const path = require('path')
const express = require('express')
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv')
const morgan  = require('morgan')
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db')
const colors = require('colors'); 
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
var cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
var hpp = require('hpp');
const app = express();


//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const reviews = require('./routes/reviews');



//Body Parser
app.use(express.json())

// Cookie Parser
app.use(cookieParser())


//Load the env variables

dotenv.config({path:'./config/config.env'})

//Connect to database
connectDB();




//Dev Logging middleware
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}


/// 'Helmet' sets security headers
// app.use(helmet());

//file uploading
app.use(fileUpload())

/// Mongo Sanitize 
app.use(mongoSanitize());

// Helmet headers
app.use(helmet());

///HPP Secrutiy
app.use(hpp()); 

//CORS
app.use(cors())

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // limit each IP to 100 requests per windowMs
  });
app.use(limiter)


// Prevent XSS attaks
app.use(xss())
//Set static folder
app.use(express.static(path.join(__dirname,'public')))


//Mount Routers
app.use('/api/v1/bootcamps',bootcamps)
app.use('/api/v1/courses',courses)
app.use('/api/v1/auth',auth)
app.use('/api/v1/reviews',reviews)

//Error Handler
app.use(errorHandler)

const PORT =  process.env.PORT || 5000;

const server = app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));


// handle Unhandled Promise rejections

process.on('unhandleRejection',(err, promise)=>{
    console.log(`Error ${err.message}`.red)
    //close server and exit process
    server.close(()=>process.exit(1))
})