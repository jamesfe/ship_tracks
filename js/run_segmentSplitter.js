/*
 * Run the thing.
 * */

const segSplitter = require('./segmentSplitter');

segSplitter.main('../data/week/3.json', '../data/hourlySplits/');
