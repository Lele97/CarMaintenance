const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const db = mongoose.connection;
const moment = require('moment')

mongoose.connect('mongodb://127.0.0.1:27017/carmaintenance');
db.on('error', () => {
    console.log("connection error")
});
db.on('open', () => {
    console.log('Connected to MongoDB');
})

/* GET home page. */
router.get('/', async function (req, res, next) {
    const response = await fetch("http://127.0.0.1:4000/data")
    const interventions = await response.json();
    console.log(interventions);
    res.render('data', {
        interventions:interventions.map(intervention => ({
            ...intervention,
            date:moment(intervention.date).format('YYYY-MM-DD')
        }))
    })
});

module.exports = router;
