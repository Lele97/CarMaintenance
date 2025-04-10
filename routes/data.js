const express = require('express');
const router = express.Router();
const Intervention = require('../models/Intervention');

router.get('/', async function (req, res, next) {
    try {
        const intervention = await Intervention.find({}, null, {
            sort: {
                date: 1
            }
        })
        res.status(200).json(intervention)
    } catch (error) {
        next(error)
    }
});

module.exports = router;