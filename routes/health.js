'use strict';

const express = require('express');
const router = express.Router();
const { isDBConnected } = require('../config/database');

function isMongoStorageEnabled() {
  const configuredMode = process.env.STORAGE_MODE ||
    (process.env.NODE_ENV === 'production' ? 'browser' : 'mongodb');
  return configuredMode === 'mongodb';
}

router.get('/live', (req, res) => {
  res.json({ status: 'ok', version: req.app.locals.appVersion });
});

router.get('/ready', (req, res) => {
  const databaseReady = !isMongoStorageEnabled() || isDBConnected();
  const status = databaseReady ? 200 : 503;

  res.status(status).json({
    status: databaseReady ? 'ok' : 'not_ready',
    checks: { database: databaseReady ? 'ok' : 'unavailable' }
  });
});

module.exports = router;
