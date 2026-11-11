'use strict';

const express = require('express');
const router = express.Router();
const moment = require('moment');
const interventionService = require('../services/interventionService');
const { validateInterventionPayload } = require('../utils/validator');
const { CATEGORIE_VALID } = require('../models/Intervention');
const { isDBConnected } = require('../config/database');

// GET /update/:id - Visualizza form di modifica
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!interventionService.isValidId(id)) {
      const err = new Error('Identificativo intervento non valido');
      err.status = 400;
      return next(err);
    }

    const intervention = await interventionService.getById(id);
    if (!intervention) {
      const err = new Error('Intervento non trovato');
      err.status = 404;
      return next(err);
    }

    res.render('update', {
      title: 'Modifica Intervento - CarMaintenance',
      categories: CATEGORIE_VALID,
      intervention: {
        ...intervention,
        dateFormatted: moment(intervention.date).format('YYYY-MM-DD')
      },
      errors: {}
    });
  } catch (error) {
    next(error);
  }
});

async function handleUpdate(req, res, next) {
  try {
    const { id } = req.params;

    if (!interventionService.isValidId(id)) {
      const err = new Error('Identificativo intervento non valido');
      err.status = 400;
      return next(err);
    }

    const { isValid, errors, data } = validateInterventionPayload(req.body);

    if (!isValid) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, errors });
      }
      return res.status(400).render('update', {
        title: 'Modifica Intervento - CarMaintenance',
        categories: CATEGORIE_VALID,
        intervention: {
          _id: id,
          ...req.body,
          dateFormatted: req.body.date
        },
        errors
      });
    }

    if (!isDBConnected()) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ success: true, item: { _id: id, ...data } });
      }
      return res.redirect(302, '/');
    }

    const updated = await interventionService.update(id, data);
    if (!updated) {
      const err = new Error('Update fallito: intervento non trovato');
      err.status = 404;
      return next(err);
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({ success: true, item: updated });
    }

    res.redirect(302, '/');
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).render('update', {
        title: 'Modifica Intervento - CarMaintenance',
        categories: CATEGORIE_VALID,
        intervention: {
          _id: req.params.id,
          ...req.body,
          dateFormatted: req.body.date
        },
        errors: { general: err.message }
      });
    }
    next(err);
  }
}

// Supporta sia PUT sia POST (via method-override)
router.put('/:id', handleUpdate);
router.post('/:id', handleUpdate);

module.exports = router;
