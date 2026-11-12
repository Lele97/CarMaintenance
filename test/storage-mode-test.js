'use strict';

const { expect } = require('chai');
const getStorageMode = require('../utils/storageMode');

describe('storage mode selection', function () {
  it('uses browser storage only in production', function () {
    expect(getStorageMode('production')).to.equal('browser');
  });

  it('uses MongoDB in development and test environments', function () {
    expect(getStorageMode('development')).to.equal('mongodb');
    expect(getStorageMode('test')).to.equal('mongodb');
  });
});
