'use strict';

const express = require('express');
const router = express.Router();
const interventionService = require('../services/interventionService');
const { validateInterventionPayload } = require('../utils/validator');
const { isDBConnected, getSanitizedUri, getDatabaseUri } = require('../config/database');
const appVersion = require('../package.json').version;

// GET /api/status
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    app: 'CarMaintenance',
    version: appVersion,
    env: process.env.NODE_ENV || 'development',
    storageMode: process.env.STORAGE_MODE || (process.env.NODE_ENV === 'production' ? 'browser' : 'mongodb'),
    isDBConnected: isDBConnected(),
    databaseUri: isDBConnected() ? getSanitizedUri(getDatabaseUri()) : null
  });
});

// GET /api/interventions
router.get('/interventions', async (req, res, next) => {
  try {
    const result = await interventionService.getAll(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/interventions/:id
router.get('/interventions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!interventionService.isValidId(id)) {
      return res.status(400).json({ error: 'ID non valido' });
    }
    const item = await interventionService.getById(id);
    if (!item) {
      return res.status(404).json({ error: 'Intervento non trovato' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/interventions
router.post('/interventions', async (req, res, next) => {
  try {
    const { isValid, errors, data } = validateInterventionPayload(req.body);
    if (!isValid) {
      return res.status(400).json({ error: 'Dati non validi', details: errors });
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database MongoDB non connesso sul server' });
    }
    const created = await interventionService.create(data);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /api/interventions/:id
router.put('/interventions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!interventionService.isValidId(id)) {
      return res.status(400).json({ error: 'ID non valido' });
    }
    const { isValid, errors, data } = validateInterventionPayload(req.body);
    if (!isValid) {
      return res.status(400).json({ error: 'Dati non validi', details: errors });
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database MongoDB non connesso sul server' });
    }
    const updated = await interventionService.update(id, data);
    if (!updated) {
      return res.status(404).json({ error: 'Intervento non trovato' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/interventions/:id
router.delete('/interventions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!interventionService.isValidId(id)) {
      return res.status(400).json({ error: 'ID non valido' });
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database MongoDB non connesso sul server' });
    }
    const deleted = await interventionService.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Intervento non trovato' });
    }
    res.json({ success: true, message: 'Eliminato con successo' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
