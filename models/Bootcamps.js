const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,'Please add a name'],
        unique:true,
        trim:true,
        maxlength:[50,'Name cannot be 50 characetrs']
    },
    slug:String,
    description:{
        type: String,
        required:[true,'Please add a description'],
        unique:true,
        trim:true,
        maxlength:[500,'Name cannot be 50 characetrs']
    },
    website:{
        type:String,
        match:[
            /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
            'Please use a a valid URL with HTTP or HTTPS'
        ]
    },
    phone:{
        type:String,
        maxlength:[20,'Phone number cannot be longer than 20 characters'],
    },
    // email:{
    //     type:String,
    //     match:[
    //         /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    //         'Please use a valid email']
    // },
    address:{
        type:String,
        required:[true,'Please add an address']
    },
    location:{
        //GeoJSON Point
        type: {
            type: [String], // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
          },
          coordinates: {
            type: [Number],
            required: false,
            index:'2dsphere'
          },
          formattedAddress:String,
          street:String,
          city:String,
          state:String,
          zipcode:[String],
          country:String,
    },
    careers:{
        type:[String],
        required:true,
        enum:[
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating:{
        type:Number,
        min:[1,'Rating must be atleast 1'],
        max:[10,'Rating cannot be more than 10'],
    },
    averageCost:{type:Number},
    photo:{
        type:String,
        default: 'no-phot.jpg'  
    },
    housing:{
        type: String,
        default:false
    },
    jobAssistance:{
        type:Boolean,
        default:false
    },
    jobGarantee:{
        type:Boolean,
        default:false
    },
    acceptGi:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
    
})

//Create bootcamo slug for the name
BootcampSchema.pre('save',function(next) {
    this.slug = slugify(this.name,{lower:true})
    console.log('Slugiy Ran',this.name)
    next()
})

// GEO-CODE Creat Location field

// BootcampSchema.pre('save', async function (next) {
//     const loc = await geocoder.geocode(this.address)
//     this.location = {
//         type: 'Point',
//         coordinates:[loc[0].longitude, loc[0].latitude],
//         formattedAddress: loc[0].formattedAddress,
//         street:loc[0].street,
//         city:loc[0].city,
//         state:loc[0].stateCode,
//         zipcode:loc[0].zipcode,
//         country:loc[0].countryCode
//     }

//     //Do not save address in DB
//     this.address = undefined

//     next()
// })

//Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove',async function(next){
    console.log(`courses being removed from bootcamp ${this._id}`)
    await this.model('Course').deleteMany({bootcamp:this._id})
    next()
})


//Reverse populae with virtuals
BootcampSchema.virtual('courses',{
    ref: 'Course',
    localField:'_id',
    foreignField: 'bootcamp',
    justOne: false
})

module.exports = mongoose.model('Bootcamp',BootcampSchema) 