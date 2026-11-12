'use strict';

function getStorageMode(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === 'production' ? 'browser' : 'mongodb';
}

module.exports = getStorageMode;
