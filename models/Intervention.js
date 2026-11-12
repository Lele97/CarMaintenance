'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const CATEGORIE_VALID = [
  'Tagliando',
  'Olio e Filtri',
  'Freni',
  'Pneumatici',
  'Batteria',
  'Revisione',
  'Riparazione Meccanica',
  'Carrozzeria',
  'Altro'
];

const InterventionSchema = new Schema(
  {
    date: {
      type: Date,
      required: [true, 'La data dell\'intervento è obbligatoria'],
      validate: {
        validator: function (v) {
          if (!v || isNaN(new Date(v).getTime())) return false;
          const year = new Date(v).getUTCFullYear();
          return year >= 1950 && year <= 2100;
        },
        message: 'La data inserita non è valida'
      }
    },
    intervento: {
      type: String,
      required: [true, 'La descrizione dell\'intervento è obbligatoria'],
      trim: true,
      minlength: [2, 'La descrizione deve contenere almeno 2 caratteri'],
      maxlength: [200, 'La descrizione non può superare 200 caratteri']
    },
    categoria: {
      type: String,
      trim: true,
      enum: {
        values: CATEGORIE_VALID,
        message: 'La categoria specificata non è valida'
      },
      default: 'Altro'
    },
    kilometri: {
      type: Number,
      required: [true, 'I chilometri sono obbligatori'],
      min: [0, 'I chilometri non possono essere negativi'],
      max: [2000000, 'Il valore dei chilometri supera il limite massimo consentito (2.000.000)'],
      validate: {
        validator: Number.isFinite,
        message: 'I chilometri devono essere un numero valido'
      }
    },
    costo: {
      type: Number,
      required: [true, 'Il costo è obbligatorio'],
      min: [0, 'Il costo non può essere negativo'],
      max: [1000000, 'Il costo supera il limite consentito (1.000.000 €)'],
      set: (val) => (typeof val === 'number' ? Math.round(val * 100) / 100 : val),
      validate: {
        validator: Number.isFinite,
        message: 'Il costo deve essere un numero valido'
      }
    },
    veicolo: {
      type: String,
      trim: true,
      default: 'Veicolo Principale',
      maxlength: [100, 'Il nome del veicolo non può superare 100 caratteri']
    },
    note: {
      type: String,
      trim: true,
      maxlength: [1000, 'Le note non possono superare 1000 caratteri'],
      default: ''
    },
    officina: {
      type: String,
      trim: true,
      maxlength: [150, 'Il nome dell\'officina non può superare 150 caratteri'],
      default: ''
    },
    parti: {
      type: String,
      trim: true,
      maxlength: [1500, 'Le parti utilizzate non possono superare 1.500 caratteri'],
      default: ''
    },
    prossimaData: {
      type: Date,
      validate: {
        validator: (value) => value == null || (
          !Number.isNaN(new Date(value).getTime()) &&
          new Date(value).getUTCFullYear() >= 1950 &&
          new Date(value).getUTCFullYear() <= 2100
        ),
        message: 'La data della prossima scadenza non è valida'
      }
    },
    prossimiKilometri: {
      type: Number,
      min: [0, 'I chilometri della prossima scadenza non possono essere negativi'],
      max: [2000000, 'I chilometri della prossima scadenza superano il limite di 2.000.000'],
      validate: {
        validator: (value) => value == null || Number.isFinite(value),
        message: 'I chilometri della prossima scadenza devono essere validi'
      }
    }
  },
  {
    timestamps: true
  }
);

// Indici utili per query e ordinamento
InterventionSchema.index({ date: -1 });
InterventionSchema.index({ veicolo: 1, date: -1 });
InterventionSchema.index({ kilometri: -1 });

const Intervention = mongoose.models.Intervention || mongoose.model('Intervention', InterventionSchema);

module.exports = Intervention;
module.exports.CATEGORIE_VALID = CATEGORIE_VALID;
