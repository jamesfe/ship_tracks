var hour = require('./render_one_hour');
// TODO: Look out for scope issues in this module.

const dataDir = '../data/hourly_2013';
const outputDir = '../output/hourly_2013/';
const startHour = new Date(2013, 0, 1, 0);

// for (var i = 0; i < 2; i++) {
for (var i = 0; i < 8000; i++) {
  targetHour = new Date(startHour.getTime() + (i * 3600 * 1000));
  console.log(`Generating for ${targetHour}.`);
  var ms = hour.renderFrame(dataDir, outputDir, targetHour);
  console.log(`Processing took ${ms}ms.`)
}

console.log('done');
