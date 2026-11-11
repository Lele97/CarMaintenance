'use strict';

const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');
const { connectDB, disconnectDB } = require('../config/database');
const Intervention = require('../models/Intervention');

describe('POST /add/insert & /add', function () {
  this.timeout(10000);

  before(async () => {
    process.env.NODE_ENV = 'test';
    try {
      await connectDB();
    } catch {}
  });

  after(async () => {
    try {
      if (Intervention.db?.readyState === 1) {
        await Intervention.deleteMany({ intervento: /Test Add/ });
      }
    } catch {}
    await disconnectDB();
  });

  it('should create a new intervention and redirect to /', async function () {
    const res = await request(app)
      .post('/add/insert')
      .send({
        date: '2024-01-15',
        categoria: 'Tagliando',
        intervento: 'Test Add Cambio Olio',
        kilometri: 105000,
        costo: 120.5
      });

    expect(res.status).to.equal(302);
    expect(res.header.location).to.equal('/');
  });

  it('should return 400 when date or intervento is missing', async function () {
    const res = await request(app)
      .post('/add/insert')
      .send({
        date: '',
        intervento: '',
        kilometri: 1000,
        costo: 50
      });

    expect(res.status).to.equal(400);
    expect(res.text.toLowerCase()).to.include('obbligatori');
  });

  it('should return 400 when kilometri is negative', async function () {
    const res = await request(app)
      .post('/add/insert')
      .send({
        date: '2024-01-15',
        intervento: 'Test Negativo',
        kilometri: -500,
        costo: 50
      });

    expect(res.status).to.equal(400);
  });

  it('should return 400 when costo is negative', async function () {
    const res = await request(app)
      .post('/add/insert')
      .send({
        date: '2024-01-15',
        intervento: 'Test Costo Negativo',
        kilometri: 500,
        costo: -20
      });

    expect(res.status).to.equal(400);
  });
});
