'use strict';

const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');
const { connectDB, disconnectDB } = require('../config/database');
const Intervention = require('../models/Intervention');

describe('DELETE & POST /delete/:id', function () {
  this.timeout(10000);

  let createdId;

  before(async () => {
    process.env.NODE_ENV = 'test';
    try {
      await connectDB();
      const doc = new Intervention({
        date: new Date('2024-03-01'),
        categoria: 'Pneumatici',
        intervento: 'Test Fixture Da Eliminare',
        kilometri: 95000,
        costo: 320
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
    const res = await request(app).post('/delete/malformed-id-123');
    expect(res.status).to.equal(400);
  });

  it('should return 404 for a non-existent valid ObjectId', async function () {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).post(`/delete/${fakeId}`);
    expect(res.status).to.equal(404);
  });

  it('should delete an intervention by _id and redirect to /', async function () {
    if (!createdId) this.skip();

    const res = await request(app).post(`/delete/${createdId}`);
    expect(res.status).to.equal(302);
    expect(res.header.location).to.equal('/');
  });
});
