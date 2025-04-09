const express = require('express');
const router = express.Router();
const Intervention = require('../models/Intervention');

router.put("/update/:id", async (req, res,next) => {
    try{
        const {id} = req.params;

        await Intervention.findByIdAndUpdate(id, req.body, {new: true});

        console.log(`🌱 Update received for intervention ${id}: ${JSON.stringify(req.body, null, 2)}`);
        console.log('✨ Intervention successfully updated. The future just got a patch.');

        res.redirect("/")
    }catch (err){
        next(err)
    }
})
