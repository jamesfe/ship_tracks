/*
 * First off: This is a world of [lat, lon] coordinates.
 *
 * What the code in this file does is this:
 *  - given an input for a file will read the file and for each feature in the file
 *  returns a map of hours -> features.
 *  - These features should then be dumped to another file where they can be read by another process.
 * */

var path = require('path');
var fs = require('fs');
var turf = require('@turf/turf');

function fullDateToDailyDate (inDate) {
  /* Takes a date and returns just the day/month/year part as a Date object  */
  if (!(inDate instanceof Date)) { throw 'invalid date'; } // TODO: throw object
  return new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate());
}

function bucketToHours (inFeature) {
  const startTime = new Date(Date.parse(inFeature.properties.trackStartTime));
  const endTime = new Date(Date.parse(inFeature.properties.trackEndTime));
  console.log(startTime, endTime);

  const bucketStart = new Date(fullDateToDailyDate(startTime).setHours(startTime.getHours()));
  var currentBucket = bucketStart.getTime();
  var buckets = new Map();

  const distance = turf.lineDistance(inFeature, 'kilometers');
  console.log("distance", distance);
  var count = -1;

  const totalTimeSeconds = (endTime - startTime) / 1000;
  console.log("total seconds: ", totalTimeSeconds);
  const kmPerSecond = (distance / totalTimeSeconds);
  console.log('km per second', kmPerSecond);
  var sliced = [];

  const secondsMovingInFirstHour = 3600 - ((startTime.getTime() / 1000) % 3600);
  const firstDistanceKm = secondsMovingInFirstHour * kmPerSecond;

  while (currentBucket <= endTime.getTime()) {
    /* We create a map of hours where we will put segments. */
    /* The bucket contains segments which occur in the 60 minutes after the key. */

    if (count === -1) {
      console.log('count is zero');
      sliced = turf.lineSliceAlong(inFeature, 0, firstDistanceKm, 'kilometers');
      console.log(0, firstDistanceKm);
      buckets.set(currentBucket, sliced);
    } else {
      console.log('count bigggger');
      const startSliceKm = firstDistanceKm + (3600 * count * kmPerSecond);
      const endSliceKm = startSliceKm + (3600 * kmPerSecond);
      console.log('start minus', startSliceKm - firstDistanceKm);
      console.log(startSliceKm, endSliceKm);
      sliced = turf.lineSliceAlong(inFeature, startSliceKm, endSliceKm, 'kilometers');
      buckets.set(currentBucket, sliced);
    }
    count++;
    currentBucket += (3600 * 1000); // millis in an hour
    console.log('bucket: ', new Date(currentBucket));
  }
  return buckets;
}

function main (targetFile) {
  /* Read from an input file and build a map of segments -> hours */
  const inData = require(targetFile);

  var hourlyFeatures = new Map();
  // for (var i = 0; i < inData.length; i++) {
  for (var i = 0; i < 1; i++) {
    var feature = inData[i];
    var tempHourly = bucketToHours(feature);
    tempHourly.forEach((value, key) => {
      if (hourlyFeatures.get(key) === undefined) {
        hourlyFeatures.set(key, [value]);
      } else {
        hourlyFeatures.get(key).push(value);
      }
    });
  }
  for (var t of hourlyFeatures) {
    console.log('t: ', new Date(t[0]));
  }
  // dumpToFile(hourlyFeatures, './testout/');
}

function createIndividualFile (outDir, key, value) {
  const dateObj = new Date(key);
  console.log(dateObj);
  const fileName = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}-${dateObj.getHours()}.json`;
  const outputName = path.join(outDir, fileName);
  fs.writeFile(outputName, JSON.stringify(value), 'utf8', err => { if (err !== undefined) { console.log(`write error: ${err}`); } });
}

function dumpToFile (inputMap, outDir) {
  /* Takes a map of date -> segments, we will dump these segments to a (named) file. */
  inputMap.forEach((v, k) => createIndividualFile(outDir, k, v));
}

module.exports = {
  main: main
};
