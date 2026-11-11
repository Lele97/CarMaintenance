'use strict';

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const mocha = new Mocha({
  timeout: 10000,
  exit: true
});

const testDir = __dirname;

fs.readdirSync(testDir)
  .filter(file => file.endsWith('-test.js') && file !== 'all-test.js')
  .forEach(file => {
    mocha.addFile(path.join(testDir, file));
  });

mocha.run(failures => {
  process.exitCode = failures ? 1 : 0;
});
