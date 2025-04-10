const express = require('express');
const router = express.Router();
const Intervention = require('../models/Intervention');

router.post('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const intervention = await Intervention.findById(id);

        if (!intervention) {
            const err = new Error("Intervento non trovato");
            err.status = 404;
            throw err;
        }
        await intervention.deleteOne({_id: id});
        console.log("🌱 Deleted Intervention with id : " + id);
        console.log("✨ Delete operation ok")
        res.redirect('/')
    } catch (err) {
        next(err);
    }
})

module.exports = router;