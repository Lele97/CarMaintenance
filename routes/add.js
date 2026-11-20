'use strict';

const express = require('express');
const router = express.Router();
const interventionService = require('../services/interventionService');
const { validateInterventionPayload } = require('../utils/validator');
const { CATEGORIE_VALID } = require('../models/Intervention');
const { isDBConnected } = require('../config/database');

// GET /add - Render form di inserimento
router.get('/', function (req, res) {
  res.render('add', {
    title: 'Nuovo Intervento - CarMaintenance',
    categories: CATEGORIE_VALID,
    formData: {
      date: new Date().toISOString().slice(0, 10),
      categoria: 'Tagliando',
      veicolo: 'Veicolo Principale',
      kilometri: '',
      costo: '',
      intervento: '',
      note: '',
      officina: '',
      parti: '',
      prossimaData: '',
      prossimiKilometri: ''
    },
    errors: {}
  });
});

async function handleInsert(req, res, next) {
  try {
    const { isValid, errors, data } = validateInterventionPayload(req.body);

    if (!isValid) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, errors });
      }
      return res.status(400).render('add', {
        title: 'Nuovo Intervento - CarMaintenance',
        categories: CATEGORIE_VALID,
        formData: req.body,
        errors
      });
    }

    if (isDBConnected()) {
      const saved = await interventionService.create(data);
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(201).json({ success: true, item: saved });
      }
    }

    return res.redirect(302, '/');
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).render('add', {
        title: 'Nuovo Intervento - CarMaintenance',
        categories: CATEGORIE_VALID,
        formData: req.body,
        errors: { general: err.message }
      });
    }
    next(err);
  }
}

// Supporta sia POST /add sia POST /add/insert
router.post('/insert', handleInsert);
router.post('/', handleInsert);

module.exports = router;
