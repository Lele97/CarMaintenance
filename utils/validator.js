'use strict';

const { CATEGORIE_VALID } = require('../models/Intervention');

function validateInterventionPayload(body) {
  const errors = {};
  const cleaned = {};

  // Data
  if (!body.date || String(body.date).trim() === '') {
    errors.date = 'La data dell\'intervento è obbligatoria';
  } else {
    const parsedDate = new Date(body.date);
    if (isNaN(parsedDate.getTime())) {
      errors.date = 'Formato data non valido (utilizzare AAAA-MM-GG)';
    } else {
      const year = parsedDate.getFullYear();
      if (year < 1950 || year > 2100) {
        errors.date = 'L\'anno deve essere compreso tra il 1950 e il 2100';
      } else {
        cleaned.date = parsedDate;
      }
    }
  }

  // Descrizione intervento
  const interventoStr = body.intervento ? String(body.intervento).trim() : '';
  if (!interventoStr) {
    errors.intervento = 'La descrizione dell\'intervento è obbligatoria';
  } else if (interventoStr.length < 2) {
    errors.intervento = 'La descrizione deve contenere almeno 2 caratteri';
  } else if (interventoStr.length > 200) {
    errors.intervento = 'La descrizione non può superare 200 caratteri';
  } else {
    cleaned.intervento = interventoStr;
  }

  // Categoria
  if (body.categoria) {
    const cat = String(body.categoria).trim();
    if (CATEGORIE_VALID.includes(cat)) {
      cleaned.categoria = cat;
    } else {
      errors.categoria = `Categoria non valida. Valori permessi: ${CATEGORIE_VALID.join(', ')}`;
    }
  } else {
    cleaned.categoria = 'Altro';
  }

  // Kilometri
  if (body.kilometri === undefined || body.kilometri === null || String(body.kilometri).trim() === '') {
    errors.kilometri = 'I chilometri sono obbligatori';
  } else {
    const kmNum = Number(body.kilometri);
    if (isNaN(kmNum)) {
      errors.kilometri = 'I chilometri devono essere un numero valido';
    } else if (kmNum < 0) {
      errors.kilometri = 'I chilometri non possono essere negativi';
    } else if (kmNum > 2000000) {
      errors.kilometri = 'I chilometri non possono superare 2.000.000 km';
    } else {
      cleaned.kilometri = Math.round(kmNum);
    }
  }

  // Costo
  if (body.costo === undefined || body.costo === null || String(body.costo).trim() === '') {
    errors.costo = 'Il costo è obbligatorio';
  } else {
    const rawCosto = String(body.costo).replace(',', '.');
    const costoNum = Number(rawCosto);
    if (isNaN(costoNum)) {
      errors.costo = 'Il costo deve essere un numero valido';
    } else if (costoNum < 0) {
      errors.costo = 'Il costo non può essere negativo';
    } else if (costoNum > 1000000) {
      errors.costo = 'Il costo non può superare 1.000.000 €';
    } else {
      cleaned.costo = Math.round(costoNum * 100) / 100;
    }
  }

  // Veicolo
  if (body.veicolo) {
    cleaned.veicolo = String(body.veicolo).trim().slice(0, 100);
  } else {
    cleaned.veicolo = 'Veicolo Principale';
  }

  // Note
  if (body.note) {
    cleaned.note = String(body.note).trim().slice(0, 1000);
  } else {
    cleaned.note = '';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: cleaned
  };
}

module.exports = {
  validateInterventionPayload
};
