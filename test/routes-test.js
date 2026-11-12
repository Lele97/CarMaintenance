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
    expect(res.text).to.include('navbar-layout');
    expect(res.text).to.include('Veicolo principale');
    expect(res.text).to.include('footer-bottom');
    expect(res.text).to.include('data-storage-mode="mongodb"');
    expect(res.text).not.to.include('toggle-storage-mode-btn');
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

  it('GET /privacy should explain storage and available deletion controls', async function () {
    const res = await request(app).get('/privacy');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Privacy e gestione dei dati');
    expect(res.text).to.include('Non esistendo ancora account');
  });

  it('GET /api/status should return 200 with server status', async function () {
    const res = await request(app).get('/api/status');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'ok');
    expect(res.body).to.have.property('storageMode', 'mongodb');
  });

  it('serves the local PWA shell and never caches API responses', async function () {
    const manifest = await request(app).get('/manifest.webmanifest');
    expect(manifest.status).to.equal(200);
    expect(JSON.parse(manifest.text)).to.have.property('start_url', '/');

    const serviceWorker = await request(app).get('/service-worker.js');
    expect(serviceWorker.status).to.equal(200);
    expect(serviceWorker.text).to.include('/vendor/bootstrap/js/bootstrap.bundle.min.js');
    expect(serviceWorker.text).to.include("page.includes('data-storage-mode=\"browser\"')");
    expect(serviceWorker.text).not.to.include("STATIC_ASSETS.includes('/api/");

    const assets = [
      '/css/style.css',
      '/js/storage.js',
      '/js/dashboard.js',
      '/vendor/bootstrap/css/bootstrap.min.css',
      '/vendor/bootstrap/js/bootstrap.bundle.min.js',
      '/vendor/chart.js/chart.umd.min.js',
      '/bootstrap-icons/bootstrap-icons.css',
      '/bootstrap-icons/fonts/bootstrap-icons.woff2',
      '/image/car-maintenance-icon.svg'
    ];
    for (const asset of assets) {
      const response = await request(app).get(asset);
      expect(response.status, asset).to.equal(200);
    }
  });

  it('GET /random-not-found-page should return 404', async function () {
    const res = await request(app).get('/random-not-found-page');
    expect(res.status).to.equal(404);
  });
});
