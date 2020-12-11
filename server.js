const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan  = require('morgan')
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db')
const colors = require('colors'); 
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const app = express();


//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');



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

//file uploading
app.use(fileUpload())

//Set static folder
app.use(express.static(path.join(__dirname,'public')))


//Mount Routers
app.use('/api/v1/bootcamps',bootcamps)
app.use('/api/v1/courses',courses)
app.use('/api/v1/auth',auth)

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