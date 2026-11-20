'use strict';

const express = require('express');
const router = express.Router();
const moment = require('moment');
const interventionService = require('../services/interventionService');
const { CATEGORIE_VALID } = require('../models/Intervention');
const { isDBConnected } = require('../config/database');
const getStorageMode = require('../utils/storageMode');

/* GET dashboard / home page */
router.get('/privacy', (req, res) => {
  res.render('privacy', {
    title: 'Privacy e dati - CarMaintenance',
    storageMode: getStorageMode()
  });
});

router.get('/', async function (req, res, next) {
  try {
    const { search, categoria, veicolo, sortBy, sortOrder, page } = req.query;

    const result = await interventionService.getAll({
      search,
      categoria,
      veicolo,
      sortBy: sortBy || 'date',
      sortOrder: sortOrder || 'desc',
      page: page || 1,
      limit: 100
    });

    const items = result.items || [];
    const stats = interventionService.calculateStats(items);

    const storageMode = getStorageMode();
    const isConnected = isDBConnected();

    res.render('data', {
      title: 'CarMaintenance Dashboard',
      interventions: items.map(item => ({
        ...item,
        dateFormatted: moment(item.date).format('DD/MM/YYYY'),
        dateInput: moment(item.date).format('YYYY-MM-DD'),
        costoFormatted: Number(item.costo).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
        kilometriFormatted: Number(item.kilometri).toLocaleString('it-IT')
      })),
      stats,
      categories: CATEGORIE_VALID,
      filters: {
        search: search || '',
        categoria: categoria || 'Tutte',
        veicolo: veicolo || 'Tutti',
        sortBy: sortBy || 'date',
        sortOrder: sortOrder || 'desc'
      },
      storageMode,
      isDBConnected: isConnected,
      env: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
