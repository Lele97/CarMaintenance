'use strict';

(function exposeMileageReadings(global, factory) {
  const findInconsistencies = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = findInconsistencies;
  if (global) global.findMileageInconsistencies = findInconsistencies;
})(typeof window !== 'undefined' ? window : null, function createMileageReadingFinder() {
  return function findMileageInconsistencies(items) {
    const readings = (Array.isArray(items) ? items : [])
      .map((item, index) => ({ item, index, date: new Date(item.date), km: Number(item.kilometri) }))
      .filter(reading => Number.isFinite(reading.date.getTime()) && Number.isFinite(reading.km))
      .sort((a, b) => a.date - b.date || a.index - b.index);

    const warnings = [];
    let highestReading = null;
    readings.forEach((reading) => {
      if (highestReading && reading.km < highestReading.km) {
        warnings.push({
          date: reading.item.date,
          kilometri: reading.km,
          precedenteData: highestReading.item.date,
          precedentiKilometri: highestReading.km
        });
      } else if (!highestReading || reading.km > highestReading.km) {
        highestReading = reading;
      }
    });

    return warnings;
  };
});
