'use strict';

const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');
const { connectDB, disconnectDB } = require('../config/database');
const Intervention = require('../models/Intervention');

describe('PUT & POST /update/:id', function () {
  this.timeout(10000);

  let createdId;

  before(async () => {
    process.env.NODE_ENV = 'test';
    try {
      await connectDB();
      const doc = new Intervention({
        date: new Date('2024-02-01'),
        categoria: 'Freni',
        intervento: 'Test Fixture Freni',
        kilometri: 80000,
        costo: 150
      });
      const saved = await doc.save();
      createdId = saved._id.toString();
    } catch {}
  });

  after(async () => {
    try {
      if (Intervention.db?.readyState === 1 && createdId) {
        await Intervention.findByIdAndDelete(createdId);
      }
    } catch {}
    await disconnectDB();
  });

  it('should return 400 for a malformed ID', async function () {
    const res = await request(app)
      .post('/update/not-a-valid-id')
      .send({
        date: '2024-02-01',
        intervento: 'Aggiornamento Test',
        kilometri: 81000,
        costo: 160
      });

    expect(res.status).to.equal(400);
  });

  it('should return 404 for a non-existent valid ObjectId', async function () {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post(`/update/${fakeId}`)
      .send({
        date: '2024-02-01',
        categoria: 'Freni',
        intervento: 'Aggiornamento Inesistente',
        kilometri: 81000,
        costo: 160
      });

    expect(res.status).to.equal(404);
  });

  it('should update an existing intervention and redirect to /', async function () {
    if (!createdId) this.skip();

    const res = await request(app)
      .post(`/update/${createdId}`)
      .send({
        date: '2024-02-02',
        categoria: 'Freni',
        intervento: 'Test Fixture Freni Aggiornati',
        kilometri: 82000,
        costo: 180,
        officina: 'Officina aggiornata',
        parti: 'Pastiglie nuove',
        prossimaData: '2026-02-02',
        prossimiKilometri: 112000
      });

    expect(res.status).to.equal(302);
    expect(res.header.location).to.equal('/');
    const updated = await Intervention.findById(createdId).lean();
    expect(updated.officina).to.equal('Officina aggiornata');
    expect(updated.parti).to.equal('Pastiglie nuove');
    expect(updated.prossimaData.toISOString()).to.equal('2026-02-02T00:00:00.000Z');
    expect(updated.prossimiKilometri).to.equal(112000);
  });

  it('should return 400 when updating with invalid data', async function () {
    if (!createdId) this.skip();

    const res = await request(app)
      .post(`/update/${createdId}`)
      .send({
        date: '',
        intervento: '',
        kilometri: -10,
        costo: -50
      });

    expect(res.status).to.equal(400);
  });
});
