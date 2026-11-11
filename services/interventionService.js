'use strict';

const mongoose = require('mongoose');
const Intervention = require('../models/Intervention');
const { isDBConnected } = require('../config/database');

// Servizio per la gestione degli interventi
const interventionService = {
  isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  },

  async getAll(options = {}) {
    if (!isDBConnected()) {
      return [];
    }

    const {
      search = '',
      categoria = '',
      veicolo = '',
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 100
    } = options;

    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ intervento: regex }, { note: regex }];
    }

    if (categoria && categoria !== 'Tutte' && categoria !== '') {
      query.categoria = categoria;
    }

    if (veicolo && veicolo !== 'Tutti' && veicolo !== '') {
      query.veicolo = veicolo;
    }

    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'kilometri') {
      sort.kilometri = order;
    } else if (sortBy === 'costo') {
      sort.costo = order;
    } else {
      sort.date = order;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));

    const [items, total] = await Promise.all([
      Intervention.find(query).sort(sort).skip(skip).limit(parseInt(limit, 10)).lean().exec(),
      Intervention.countDocuments(query).exec()
    ]);

    return {
      items,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10)))
    };
  },

  async getAllSimple() {
    if (!isDBConnected()) {
      return [];
    }
    return Intervention.find({}).sort({ date: -1 }).lean().exec();
  },

  async getById(id) {
    if (!this.isValidId(id)) {
      return null;
    }
    if (!isDBConnected()) {
      return null;
    }
    return Intervention.findById(id).lean().exec();
  },

  async create(payload) {
    if (!isDBConnected()) {
      throw new Error('Database non connesso');
    }
    const doc = new Intervention(payload);
    return doc.save();
  },

  async update(id, payload) {
    if (!this.isValidId(id)) {
      return null;
    }
    if (!isDBConnected()) {
      throw new Error('Database non connesso');
    }
    return Intervention.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    }).lean().exec();
  },

  async delete(id) {
    if (!this.isValidId(id)) {
      return null;
    }
    if (!isDBConnected()) {
      throw new Error('Database non connesso');
    }
    return Intervention.findByIdAndDelete(id).lean().exec();
  },

  calculateStats(interventions) {
    const list = Array.isArray(interventions) ? interventions : [];

    const totalCost = list.reduce((sum, item) => sum + (Number(item.costo) || 0), 0);
    const totalCount = list.length;
    const avgCost = totalCount > 0 ? totalCost / totalCount : 0;

    let maxKm = 0;
    let minKm = null;
    list.forEach(item => {
      const km = Number(item.kilometri) || 0;
      if (km > maxKm) maxKm = km;
      if (minKm === null || km < minKm) minKm = km;
    });

    const kmCovered = minKm !== null && maxKm >= minKm ? maxKm - minKm : 0;
    const costPerKm = kmCovered > 0 ? totalCost / kmCovered : null;

    // Distribuzione spese per categoria
    const categoriesMap = {};
    list.forEach(item => {
      const cat = item.categoria || 'Altro';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + (Number(item.costo) || 0);
    });

    // Spese mensili (ultimi 6 mesi o cronologiche)
    const monthlyMap = {};
    const sortedByDate = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedByDate.forEach(item => {
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + (Number(item.costo) || 0);
      }
    });

    // Calcolo scadenze e promemoria
    const upcoming = [];
    const now = new Date();

    // 1. Tagliando (ogni 15.000 km o 1 anno)
    const tagliandi = list.filter(i => (i.categoria === 'Tagliando' || /tagliando/i.test(i.intervento)));
    const ultimoTagliando = tagliandi.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (ultimoTagliando) {
      const kmDelta = maxKm - (ultimoTagliando.kilometri || 0);
      const kmMancanti = Math.max(0, 15000 - kmDelta);
      const mesiDelta = (now.getFullYear() - new Date(ultimoTagliando.date).getFullYear()) * 12 +
        (now.getMonth() - new Date(ultimoTagliando.date).getMonth());

      let status = 'ok';
      if (kmDelta >= 15000 || mesiDelta >= 12) status = 'scaduto';
      else if (kmDelta >= 13000 || mesiDelta >= 10) status = 'imminente';

      upcoming.push({
        titolo: 'Prossimo Tagliando',
        descrizione: `Soglia ogni 15.000 km o 12 mesi (Ultimo a ${ultimoTagliando.kilometri.toLocaleString('it-IT')} km)`,
        kmMancanti,
        status,
        priorita: status === 'scaduto' ? 'Alta' : (status === 'imminente' ? 'Media' : 'Bassa')
      });
    } else if (list.length > 0) {
      upcoming.push({
        titolo: 'Tagliando Generale',
        descrizione: 'Nessun tagliando registrato finora',
        kmMancanti: 0,
        status: 'imminente',
        priorita: 'Media'
      });
    }

    // 2. Revisione Ministeriale (ogni 2 anni)
    const revisioni = list.filter(i => (i.categoria === 'Revisione' || /revisione/i.test(i.intervento)));
    const ultimaRevisione = revisioni.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (ultimaRevisione) {
      const dataRev = new Date(ultimaRevisione.date);
      const dataScadenza = new Date(dataRev);
      dataScadenza.setFullYear(dataRev.getFullYear() + 2);

      const giorniMancanti = Math.round((dataScadenza - now) / (1000 * 60 * 60 * 24));
      let status = 'ok';
      if (giorniMancanti < 0) status = 'scaduto';
      else if (giorniMancanti <= 60) status = 'imminente';

      upcoming.push({
        titolo: 'Revisione Ministeriale',
        descrizione: `Scadenza stimata entro 2 anni (Ultima: ${dataRev.toLocaleDateString('it-IT')})`,
        giorniMancanti,
        status,
        priorita: status === 'scaduto' ? 'Alta' : (status === 'imminente' ? 'Alta' : 'Bassa')
      });
    }

    // 3. Controllo Freni (ogni 30.000 km)
    const freni = list.filter(i => (i.categoria === 'Freni' || /fren/i.test(i.intervento)));
    const ultimiFreni = freni.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (ultimiFreni) {
      const deltaFreni = maxKm - (ultimiFreni.kilometri || 0);
      const kmFreniMancanti = Math.max(0, 30000 - deltaFreni);
      let status = 'ok';
      if (deltaFreni >= 30000) status = 'scaduto';
      else if (deltaFreni >= 25000) status = 'imminente';

      upcoming.push({
        titolo: 'Controllo Freni & Pastiglie',
        descrizione: `Soglia ogni 30.000 km (Ultimo a ${ultimiFreni.kilometri.toLocaleString('it-IT')} km)`,
        kmMancanti: kmFreniMancanti,
        status,
        priorita: status === 'scaduto' ? 'Alta' : 'Media'
      });
    }

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalCount,
      avgCost: Math.round(avgCost * 100) / 100,
      maxKm,
      costPerKm: costPerKm !== null ? Math.round(costPerKm * 1000) / 1000 : null,
      categoriesMap,
      monthlyMap,
      upcoming
    };
  }
};

module.exports = interventionService;
