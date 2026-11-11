'use strict';

const { connectDB, disconnectDB } = require('../config/database');

exports.mochaHooks = {
  async beforeAll() {
    process.env.NODE_ENV = 'test';
    try {
      await connectDB();
    } catch (err) {
      console.warn('⚠️  MongoDB non attivo per i test di integrazione, alcuni test potrebbero operare in modalità isolata.');
    }
  },
  async afterAll() {
    await disconnectDB();
  }
};
