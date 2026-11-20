'use strict';

const { expect } = require('chai');
const findMileageInconsistencies = require('../public/javascripts/mileageReadings');

describe('Mileage reading consistency', function () {
  it('warns on readings below the highest earlier odometer without changing records', function () {
    const readings = [
      { date: '2024-03-01', kilometri: 160000 },
      { date: '2024-01-01', kilometri: 150000 },
      { date: '2024-02-01', kilometri: 170000 }
    ];

    const warnings = findMileageInconsistencies(readings);

    expect(warnings).to.deep.equal([{
      date: '2024-03-01',
      kilometri: 160000,
      precedenteData: '2024-02-01',
      precedentiKilometri: 170000
    }]);
    expect(readings[0].kilometri).to.equal(160000);
  });

  it('does not warn for an increasing odometer history', function () {
    expect(findMileageInconsistencies([
      { date: '2024-01-01', kilometri: 100 },
      { date: '2024-02-01', kilometri: 200 }
    ])).to.deep.equal([]);
  });
});
