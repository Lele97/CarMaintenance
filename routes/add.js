const express = require('express');
const router = express.Router();
const Intervention = require('../models/Intervention');


/* GET add page. */
router.get('/', function(req, res, next) {
    res.render('add');
});

/* POST Insert new intervention. */
router.post("/insert", async (req, res, next) => {
    const date = req.body.date;
    const intervento = req.body.intervento;
    const costo = req.body.costo;
    const kilometri = req.body.kilometri;
    const newIntervention = new Intervention({
        date,
        intervento,
        kilometri,
        costo
    });

    await newIntervention.save().then(() => {

        console.log('Request body output '
            + JSON.stringify(req.body));

        console.log("Succefully inserted!");

        res.redirect('/');

    }).catch((err) => {
        console.log(err);
    })
})

module.exports = router;