/*
 * First off: This is a world of [lat, lon] coordinates.
 * */

const LAT = 0;
const LON = 1;

var turf = require('@turf/turf');

function fullDateToDailyDate (inDate) {
  /* Takes a date and returns just the day/month/year part as a Date object  */
  if (!(inDate instanceof Date)) { throw 'invalid date'; } // TODO: throw object
  return new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate());
}

function fromCoord (coord) {
  return ({ latitude: coord[LAT], longitude: coord[LON] });
}

function breakFromMain (tail, distance) {
  /* Given an amount of distance, break up the coordinates into some of that distance
   * plus the tail of remaining distance. */
  var head = [];

  var currentLength = 0;
  var currentIndex = 0;
  head.push(currentIndex); // initialize it

  while (currentLength < distance) {
    if (tail.length <= 1) {
      console.log('head-tail fail');
      break;
    }
    const segLength = geolib.getDistance(fromCoord(tail[0]), fromCoord(tail[1]));
    if (currentLength + segLength > distance) {
      const splitPoint = getSplitPoint(tail[0], tail[1], distance);
      head.append(splitPoint);
      tail[1] = splitPoint;
      // return
    } else {
      head.push(tail[0]);
      tail = tail.slice(1);
      // continue going forward
    }
  }

  return ({
    head: head,
    tail: tail
  });
}

function bucketToHours (inFeature) {
  const startTime = new Date(Date.parse(inFeature.properties.trackStartTime));
  const endTime = new Date(Date.parse(inFeature.properties.trackEndTime));

  const bucketStart = new Date(fullDateToDailyDate(startTime).setHours(startTime.getHours()));
  var currentBucket = bucketStart;
  var buckets = new Map();


  const distance = turf.lineDistance(inFeature, 'kilometers');

  var count = 0;
  var currentDistanceKm = 0;

  const totalTimeSeconds = (endTime - startTime) / 1000;
  const kmPerSecond = (distance / totalTimeSeconds) / 1000;

  var firstHourSeconds = 0;
  while (endTime.getTime() >= currentBucket.getTime()) {
    /* We create a map of hours where we will put segments. */
    /* The bucket contains segments which occur in the 60 minutes after the key. */
    buckets[currentBucket] = []; // an empty array to which we will append coordinates.
    if (count === 0) {
      firstHourSeconds = (startTime.getMinutes() * 60) + startTime.getSeconds();
      const firstDistanceKm = firstHourSeconds * kmPerSecond;
      var sliced = turf.lineSliceAlong(inFeature, 0, firstDistanceKm, 'kilometers');
      buckets[currentBucket].push(sliced);
    } else {
      var startSliceKm = (firstHourSeconds + (3600 * count)) * kmPerSecond;
      var endSliceKm = (firstHourSeconds + (3600 * count + 1)) * kmPerSecond;
      var sliced = turf.lineSliceAlong(inFeature, startSliceKm, endSliceKm, 'kilometers');
      buckets[currentBucket].push(sliced);
    }
    currentBucket.setHours(currentBucket.getHours() + 1);
    count++;
  }
  return buckets;
}

function main (targetFile) {
  const inData = require(targetFile);

  var hourlyFeatures = new Map();
  // for (var i = 0; i < inData.length; i++) {
  for (var i = 0; i < 10; i++) {
    var feature = inData[i];
    var tempHourly = bucketToHours(feature);
    console.log(tempHourly);
    tempHourly.forEach((key, value) => hourlyFeatures[key].append(value));
  }
  console.log(tempHourly);
}

module.exports = {
  main: main
};
