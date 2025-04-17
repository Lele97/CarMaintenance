const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const mocha = new Mocha();

// Percorso alla cartella dei test
const testDir = __dirname

// Aggiunge tutti i file che finiscono con -test.js
fs.readdirSync(testDir)
    .filter(file => file.endsWith('-test.js'))
    .forEach(file => {
        mocha.addFile(path.join(testDir, file));
    });

// Esecuzione dei test
mocha.run(failures => {
    process.exitCode = failures ? 1 : 0;
});