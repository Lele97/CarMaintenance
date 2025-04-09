const express = require('express');
const router = express.Router();
const Intervention = require('../models/Intervention');

router.get('/:id', async (req, res, next) => {
    try {
        const interventionId = req.params.id;
        const intervention = await Intervention.findById(interventionId);
        if (!intervention) {
            const err = new Error("Intervento non trovato");
            err.status = 404;
            throw err;
        }
        console.log('🌱 Intervention with id ', interventionId);
        res.render('update', {
            intervention: intervention,
        });
    } catch (error) {
        next(error);
    }
})

router.post('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const updated = await Intervention.findByIdAndUpdate(id, req.body, {new: true});

        if (!updated) {
            const err = new Error("Update fallito: intervento non trovato");
            err.status = 404;
            throw err;
        }

        console.log(`🌱 Intervention ${id} updated:`);
        console.log(`🌱 Update received for intervention ${id}: ${JSON.stringify(req.body, null, 2)}`);
        console.log('✨ Intervention successfully updated. The future just got a patch.');
        res.redirect("/")
    } catch (err) {
        next(err)
    }
})

module.exports = router;
