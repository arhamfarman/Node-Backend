const express = require('express')

const {
    getBootcamps,
    postBootcamps,
    updateBootcamps,
    deleteBootcamps,
    getOneBootcamps,
    bootcampPhotoUpload
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamps')

// const advancedResults = require('../middleware/advancedResults')


// Include other resourse routers
const courseRouter = require('./courses')
const reviewsRouter = require('./reviews')

const { protect,authorize } = require('../middleware/auth')


const router  = express.Router();


//Re-route into other resours routers

router.use('/:bootcampID/courses',courseRouter)
router.use('/:bootcampID/reviews',reviewsRouter)

router.route('/').get(getBootcamps).post(protect,authorize('publisher','admin'),postBootcamps);

router.route('/:id').put(protect,authorize('publisher','admin'),updateBootcamps)
.delete(protect,authorize('publisher','admin'),deleteBootcamps)
.get(getOneBootcamps)

router.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload)

module.exports = router;