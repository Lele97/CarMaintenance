'use strict';

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/database');

describe('🌐 ROUTE TESTS :: CarMaintenance', function () {
  this.timeout(10000);

  before(async () => {
    process.env.NODE_ENV = 'test';
    try {
      await connectDB();
    } catch {}
  });

  after(async () => {
    await disconnectDB();
  });

  it('GET / should return 200 and render dashboard', async function () {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('CarMaintenance');
  });

  it('GET /data should return 200 with JSON array', async function () {
    const res = await request(app).get('/data');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('GET /add should return 200 and render form', async function () {
    const res = await request(app).get('/add');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Nuovo Intervento');
  });

  it('GET /api/status should return 200 with server status', async function () {
    const res = await request(app).get('/api/status');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'ok');
  });

  it('GET /random-not-found-page should return 404', async function () {
    const res = await request(app).get('/random-not-found-page');
    expect(res.status).to.equal(404);
  });
});
