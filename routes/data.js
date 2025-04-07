const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const db = mongoose.connection;
const Intervention = require('../models/Intervention');

mongoose.connect('mongodb://127.0.0.1:27017/carmaintenance');
db.on('error', () => {
    console.log("connection error")
});

db.on('open', () => {
    console.log('Connected to MongoDB');
})

router.get('/', async function (req, res, next) {
    try {
        const intervention = await Intervention.find(undefined, undefined, undefined)
        res.render('data', {
            interventions: intervention
        });
    } catch (error) {
        next(error)
    }
});

module.exports = router;