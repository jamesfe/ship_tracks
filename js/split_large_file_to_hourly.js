/*
 * Split a larg file of ship lines into hourly files in a given directory.
 * */

const segSplitter = require('./segmentSplitter');

// segSplitter.main('../data/1jan_shiplines2013_data.json', '../data/hourly_2013/');
segSplitter.main('../data/ship_lines_2013.json', '../data/hourly_2013/');
// segSplitter.main('./test/one_test_line.json', './test/output/');
