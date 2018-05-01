/*
 * Split a larg file of ship lines into hourly files in a given directory.
 * */

const segSplitter = require('./segmentSplitter');

segSplitter.main('../data/1jan_shiplines2013.json', '../data/hourly_2013_1jan/');
