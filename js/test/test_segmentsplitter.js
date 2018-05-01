

let test_data = require('./data_for_tests.js');
var seg = require('../segmentSplitter.js');

var fs = require('fs');
var readline = require('readline');
var turf = require('@turf/turf');
var assert = require('assert');

describe('utility function tests', function() {
  it('should return a date', function() {
    assert.ok(seg.fullDateToDailyDate(new Date(2012, 1, 1)) instanceof Date);
  });

  it('should not return any seconds', function() {
    let results = seg.fullDateToDailyDate(new Date(2012, 1, 1, 12, 1, 45));
    assert.equal(results.getSeconds(), 0);
  });

});

describe('slicing works properly', function() {

});

function checkStartAndEndPoints(results) {
  results.forEach((x, index) => {
    if (index >= 1) {
      let b = x.geometry.coordinates[0];
      let c = results[index - 1].geometry.coordinates.slice(-1)[0];
      b.forEach((t, i) => {
        assert.equal(t, c[i]);
      });
    }
  });
}

function checkSimilarLengths(results) {
  let lengths = Array.from(results.values()).map(x => turf.lineDistance(x.geometry)).slice(1, -1);
  let first = lengths[0];
  let factor = 10000;
  lengths.forEach(x => {
    assert.equal(Math.round(first * factor), Math.round(x * factor));
  });
}

describe('bucketing works', function() {
  it('should create 8 buckets for a 7:55 segment', function() {
    let results = seg.bucketToHours(test_data.eight_hour_seg);
    assert.equal(results.size, 8);
  });

  it('should create similar length segments for the first segments', function() {
    let results = seg.bucketToHours(test_data.eight_hour_seg);
    checkSimilarLengths(results);
  });

  it('should make the end of one seg the start of the next', function() {
    let results = Array.from(seg.bucketToHours(test_data.eight_hour_seg).values());
    checkStartAndEndPoints(results);
  });

});

describe('it should work on fifty random lines', function() {
  it('should load a file of fity items and have similar lengths.', function() {
    var rd = readline.createInterface({ input: fs.createReadStream('./test/fifty_test_lines.json') });
    rd.on('line', function(line) {
      let feature = JSON.parse(line);
      let results = seg.bucketToHours(test_data.eight_hour_seg);
      checkSimilarLengths(results);
    });
  });

  it('should load a file of fity items and have similar start and end points.', function() {
    var rd = readline.createInterface({ input: fs.createReadStream('./test/fifty_test_lines.json') });
    rd.on('line', function(line) {
      let feature = JSON.parse(line);
      let results = seg.bucketToHours(test_data.eight_hour_seg);
      checkStartAndEndPoints(results);
    });
  });

});
