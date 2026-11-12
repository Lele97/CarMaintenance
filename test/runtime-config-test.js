'use strict';

const { expect } = require('chai');
const { isNgrokEnabled } = require('../utils/runtimeConfig');

describe('runtime configuration', function () {
  it('only enables ngrok when explicitly requested outside production', function () {
    expect(isNgrokEnabled({ NODE_ENV: 'development', ENABLE_NGROK: 'true' })).to.equal(true);
    expect(isNgrokEnabled({ NODE_ENV: 'production', ENABLE_NGROK: 'true' })).to.equal(false);
    expect(isNgrokEnabled({ NODE_ENV: 'development', ENABLE_NGROK: 'false' })).to.equal(false);
  });
});
