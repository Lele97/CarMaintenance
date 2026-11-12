'use strict';

const { expect } = require('chai');
const { validateInterventionPayload } = require('../utils/validator');

describe('Intervention payload validation', function () {
  const validPayload = {
    date: '2024-05-10',
    categoria: 'Tagliando',
    intervento: 'Cambio olio',
    kilometri: '120000',
    costo: '150.50',
    officina: 'Officina Test',
    parti: 'Filtro olio e lubrificante',
    prossimaData: '2025-05-10',
    prossimiKilometri: '135000'
  };

  it('normalizes workshop, parts and next-due details', function () {
    const result = validateInterventionPayload(validPayload);

    expect(result.isValid).to.equal(true);
    expect(result.data.officina).to.equal('Officina Test');
    expect(result.data.parti).to.equal('Filtro olio e lubrificante');
    expect(result.data.prossimaData.toISOString()).to.equal('2025-05-10T00:00:00.000Z');
    expect(result.data.prossimiKilometri).to.equal(135000);
  });

  it('rejects malformed or out-of-range next-due details', function () {
    const result = validateInterventionPayload({
      ...validPayload,
      prossimaData: '2025-02-30',
      prossimiKilometri: '2000001',
      officina: 'x'.repeat(151),
      parti: 'x'.repeat(1501)
    });

    expect(result.isValid).to.equal(false);
    expect(result.errors).to.have.property('prossimaData');
    expect(result.errors).to.have.property('prossimiKilometri');
    expect(result.errors).to.have.property('officina');
    expect(result.errors).to.have.property('parti');
  });

  it('leaves optional due fields empty when omitted', function () {
    const result = validateInterventionPayload({
      date: '2024-05-10',
      intervento: 'Cambio olio',
      kilometri: 120000,
      costo: 150
    });

    expect(result.isValid).to.equal(true);
    expect(result.data.prossimaData).to.equal(null);
    expect(result.data.prossimiKilometri).to.equal(null);
  });
});
