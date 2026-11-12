'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { expect } = require('chai');

describe('browser storage privacy controls', function () {
  it('clears local interventions without restoring the demo seed on next initialization', async function () {
    const values = new Map();
    const sandbox = {
      window: {},
      localStorage: {
        getItem: (key) => values.has(key) ? values.get(key) : null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: (key) => values.delete(key)
      },
      console
    };
    const source = fs.readFileSync(path.join(__dirname, '../public/javascripts/storage.js'), 'utf8');

    vm.runInNewContext(source, sandbox);
    const storage = sandbox.window.CarStorage;

    await storage.init();
    expect(await storage.getAll()).to.have.length.greaterThan(0);

    await storage.clearAll();
    expect(Array.from(await storage.getAll())).to.deep.equal([]);

    await storage.init();
    expect(Array.from(await storage.getAll())).to.deep.equal([]);
  });
});
