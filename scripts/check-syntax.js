'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sourceDirectories = ['bin', 'config', 'models', 'routes', 'scripts', 'services', 'test', 'utils', 'public/javascripts'];
const sourceFiles = ['app.js', 'bin/www'];

function collectJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectJavaScriptFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.js') ? [entryPath] : [];
  });
}

for (const directory of sourceDirectories) {
  sourceFiles.push(...collectJavaScriptFiles(directory));
}

for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.error) {
    console.error(`Unable to check ${file}: ${result.error.message}`);
    process.exitCode = 1;
  } else if (result.status !== 0) {
    process.exitCode = result.status || 1;
  }
}
