/*
 * What the code in this file does is this:
 *  - given an input for a file will read the file and for each feature in the file
 *  returns a map of hours -> features.
 *  - These features should then be dumped to another file where they can be read by another process.
 * */

var path = require('path');
var fs = require('fs');
var turf = require('@turf/turf');

function DateNotProvided () {
  this.message = 'Date was not provided.';
  this.name = 'DateNotProvided';
}

function fullDateToDailyDate (inDate) {
  /* Takes a date and returns just the day/month/year part as a Date object  */
  if (!(inDate instanceof Date)) { throw new DateNotProvided(); }
  return new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate());
}

function bucketToHours (inFeature) {
  const startTime = new Date(Date.parse(inFeature.properties.trackStartTime));
  const endTime = new Date(Date.parse(inFeature.properties.trackEndTime));

  var currentBucket = new Date(fullDateToDailyDate(startTime).setHours(startTime.getHours())).getTime();
  var buckets = new Map();

  const turfFeature = turf.lineString(inFeature.geometry.coordinates[0]);
  const distance = turf.lineDistance(turfFeature, 'kilometers');

  const totalTimeSeconds = (endTime - startTime) / 1000;
  const kmPerSecond = (distance / totalTimeSeconds);

  const secondsMovingInFirstHour = 3600 - ((startTime.getTime() / 1000) % 3600);
  const firstDistanceKm = secondsMovingInFirstHour * kmPerSecond;

  var count = -1;
  while (currentBucket <= endTime.getTime()) {
    /* We create a map of hours where we will put segments. */
    /* The bucket contains segments which occur in the 60 minutes after the key. */

    if (count === -1) {
      var sliced = turf.lineSliceAlong(turfFeature, 0, firstDistanceKm, 'kilometers');
      sliced.properties = JSON.parse(JSON.stringify(inFeature.properties));
      buckets.set(currentBucket, sliced);
    } else {
      const startSliceKm = firstDistanceKm + (3600 * count * kmPerSecond);
      const endSliceKm = startSliceKm + (3600 * kmPerSecond);
      sliced = turf.lineSliceAlong(turfFeature, startSliceKm, endSliceKm, 'kilometers');
      sliced.properties = JSON.parse(JSON.stringify(inFeature.properties));
      buckets.set(currentBucket, sliced);
    }
    count++;
    currentBucket += (3600 * 1000); // millis in an hour
  }
  return buckets;
}

function main (targetFile, outDir) {
  /* Read from an input file and build a map of segments -> hours */
  const inData = require(targetFile);
  var totalWrites = 0;
  for (var i = 0; i < inData.length; i++) {
    var feature = inData[i];
    var tempHourly = bucketToHours(feature);
    totalWrites += dumpToFile(tempHourly, outDir);
  }
  console.log(`Total file handles written to: ${totalWrites}`);
}

function writeHourBucketToFile (outDir, key, value) {
  /* Takes what used to b e a bucket; a key (timestamp in millis) and a value (array of features)
   * and writes these to a file with one feature per line */
  if (value !== undefined) {
    const dateObj = new Date(key);
    const fileName = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}-${dateObj.getHours()}.geo.json`;
    const outputName = path.join(outDir, fileName);
    // console.log(`Writing to ${outputName}`);
    fs.appendFileSync(outputName, JSON.stringify(value) + '\n', 'utf8', err => { if (err) { console.log(`write error: ${err}`); } });
  } else {
    console.log(`${key} was null, did not write anything.`);
  }
}

function dumpToFile (inputMap, outDir) {
  /* Takes a map of date -> segments, we will dump these segments to a (named) file. */
  inputMap.forEach((v, k) => writeHourBucketToFile(outDir, k, v));
  return (inputMap.size);
}

module.exports = {
  main: main
};
