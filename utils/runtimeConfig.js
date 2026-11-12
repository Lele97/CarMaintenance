'use strict';

function isNgrokEnabled(environment = process.env) {
  return environment.NODE_ENV !== 'production' && environment.ENABLE_NGROK === 'true';
}

module.exports = { isNgrokEnabled };
