/*
 * Run the thing.
 * */

const segSplitter = require('./segmentSplitter');

segSplitter.main('../data/ship_lines_2013.json', '../data/hourly_2013/');
