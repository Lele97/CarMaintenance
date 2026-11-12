'use strict';

const express = require('express');
const router = express.Router();
const interventionService = require('../services/interventionService');
const { isDBConnected } = require('../config/database');
const appVersion = require('../package.json').version;

// GET /data - Lista tutti gli interventi in JSON
router.get('/', async function (req, res, next) {
  try {
    const { search, categoria, veicolo, sortBy, sortOrder } = req.query;

    if (!isDBConnected()) {
      return res.status(200).json([]);
    }

    const result = await interventionService.getAll({
      search,
      categoria,
      veicolo,
      sortBy: sortBy || 'date',
      sortOrder: sortOrder || 'asc',
      limit: 1000
    });

    res.status(200).json(result.items || []);
  } catch (error) {
    next(error);
  }
});

// GET /data/stats - Statistiche aggregate
router.get('/stats', async function (req, res, next) {
  try {
    const items = await interventionService.getAllSimple();
    const stats = interventionService.calculateStats(items);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /data/export - Esportazione in JSON o CSV
router.get('/export', async function (req, res, next) {
  try {
    const format = (req.query.format || 'json').toLowerCase();
    const items = await interventionService.getAllSimple();

    if (format === 'csv') {
      const headers = ['id', 'date', 'veicolo', 'categoria', 'intervento', 'kilometri', 'costo', 'note'];
      const rows = items.map(i => [
        i._id,
        new Date(i.date).toISOString().slice(0, 10),
        `"${(i.veicolo || 'Veicolo Principale').replace(/"/g, '""')}"`,
        `"${(i.categoria || 'Altro').replace(/"/g, '""')}"`,
        `"${(i.intervento || '').replace(/"/g, '""')}"`,
        i.kilometri || 0,
        i.costo || 0,
        `"${(i.note || '').replace(/"/g, '""')}"`
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="carmaintenance-export-${new Date().toISOString().slice(0, 10)}.csv"`);
      return res.status(200).send(csvContent);
    }

    // Default JSON
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="carmaintenance-export-${new Date().toISOString().slice(0, 10)}.json"`);
    res.status(200).json({
      app: 'CarMaintenance',
      version: appVersion,
      exportedAt: new Date().toISOString(),
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
