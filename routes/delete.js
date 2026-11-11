'use strict';

const express = require('express');
const router = express.Router();
const interventionService = require('../services/interventionService');
const { isDBConnected } = require('../config/database');

async function handleDelete(req, res, next) {
  try {
    const { id } = req.params;

    if (!interventionService.isValidId(id)) {
      const err = new Error('Identificativo intervento non valido');
      err.status = 400;
      return next(err);
    }

    if (!isDBConnected()) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ success: true, message: 'Eliminato dal client' });
      }
      return res.redirect(302, '/');
    }

    const deleted = await interventionService.delete(id);
    if (!deleted) {
      const err = new Error('Intervento non trovato');
      err.status = 404;
      return next(err);
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({ success: true, message: 'Intervento eliminato con successo' });
    }

    res.redirect(302, '/');
  } catch (err) {
    next(err);
  }
}

// Supporta sia DELETE sia POST (via method-override)
router.delete('/:id', handleDelete);
router.post('/:id', handleDelete);

module.exports = router;
