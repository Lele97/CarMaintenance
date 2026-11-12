'use strict';

const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/carmaintenance';

function getSanitizedUri(uri) {
  try {
    const parsed = new URL(uri);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return uri.replace(/\/\/[^@]+@/, '//***:***@');
  }
}

function getDatabaseUri() {
  if (process.env.NODE_ENV === 'test') {
    return process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/carmaintenance_test';
  }
  return process.env.MONGODB_URI || DEFAULT_URI;
}

let isConnecting = false;

async function connectDB(customUri) {
  const uri = customUri || getDatabaseUri();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', reject);
    });
  }

  isConnecting = true;

  try {
    const sanitized = getSanitizedUri(uri);
    console.log(`🔌 Connessione a MongoDB in corso (${sanitized})...`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    console.log(`🌱 Connessione a MongoDB stabilita (${sanitized})`);
    return mongoose.connection;
  } catch (error) {
    console.error(`❌ Errore durante la connessione a MongoDB (${error.name || 'DatabaseError'}).`);
    throw error;
  } finally {
    isConnecting = false;
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('🔌 Disconnesso da MongoDB');
  }
}

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  disconnectDB,
  isDBConnected,
  getDatabaseUri,
  getSanitizedUri
};
