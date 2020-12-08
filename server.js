const express = require('express')
const dotenv = require('dotenv')
const morgan  = require('morgan')
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db')
const colors = require('colors'); 

const app = express();


//Route files
const bootcamps = require('./routes/bootcamps');
const { use } = require('./routes/bootcamps');

//Body Parser
app.use(express.json())


//Load the env variables

dotenv.config({path:'./config/config.env'})

//Connect to database
connectDB();



//Dev Logging middleware
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}


//Mount Routers
app.use('/api/v1/bootcamps',bootcamps)


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