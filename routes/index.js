const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const db = mongoose.connection;

mongoose.connect('mongodb://127.0.0.1:27017/carmaintenance');
db.on('error', ()=>{console.log("connection error")});
db.on('open', ()=>{console.log('Connected to MongoDB');})


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
