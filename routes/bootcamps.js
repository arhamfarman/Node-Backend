const express = require('express')

const {
    getBootcamps,
    postBootcamps,
    updateBootcamps,
    deleteBootcamps,
    getOneBootcamps
} = require('../controllers/bootcamps')

const router  = express.Router();

router.route('/').get(getBootcamps).post(postBootcamps);

router.route('/:id').put(updateBootcamps)
.delete(deleteBootcamps)
.get(getOneBootcamps)

module.exports = router;