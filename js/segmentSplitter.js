/*
 * First: This is a world of [lat, lon] coordinates.
 * */

const LAT = 0;
const LON = 1;

var geolib = require('geolib');
var LineByLine = require('n-readlines');

function fullDateToDailyDate (inDate) {
  /* Takes a date and returns just the day/month/year part as a Date object  */
  return new Date(inDate.getYear(), inDate.getMonth(), inDate.getDate());
}

function formatToDatePlusHours (inDate) {
  return inDate.toString();
}

function lineHandler (inLine) {
  /*
   * Input: A line which is valid JSON and a valid GeoJSON line geometry
   * Output: A map containing time keys (ex below) and valid GeoJSON geometries
   * Time Key: YYYY-MM-DD-HH_to_YYYY-MM-DD-HH
   * */
  var feature = JSON.parse(inLine);
  console.log(inLine);
  return (feature);
}

function getfirstSegDistance (startTime, metersPerSecond) {
  const firstSegmentSeconds = (startTime.getMinutes() * 60) + startTime.getSeconds();
  return (firstSegmentSeconds * metersPerSecond);
}

function fromCoord (coord) {
  return ({ latitude: coord[LAT], longitude: coord[LON] });
}

function getSplitPoint (pt1, pt2, partialDist) {
  /* Given two coordinate pairs and a distance, find the point on the line that is that far from
   * pt1 in the direction of pt2 */
  // Problem: does not account for curvature of earth
  const totalDist = geolib.getDistance(fromCoord(pt1), fromCoord(pt2));
  const ratio = 1 - (partialDist / totalDist);
  const newX = ratio * (pt1[0] - pt2[0]);
  const newY = ratio * (pt1[1] - pt2[1]);
  return [newX, newY];
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
  const coordinates = inFeature.geometry.coordinates[0];
  const startTime = Date.parse(inFeature.properties.trackStartTime);
  const endTime = Date.parse(inFeature.properties.trackEndTime);

  const bucketStart = fullDateToDailyDate(startTime).setHours(startTime.getHours());
  var currentBucket = bucketStart;
  var buckets = new Map();
  while (endTime < currentBucket) {
    /* We create a map of hours where we will put segments. */
    /* The bucket contains segments which occur in the 60 minutes after the key. */
    // const formattedDate = formatToDatePlusHours(currentBucket); // let's try key'ing with the date instead of this
    buckets[currentBucket] = []; // an empty array to which we will append coordinates.
    currentBucket.setHours(currentBucket.getHours() + 1); // TODO: does this work??
  }

  // Here what we do is we calculate the average speed for the segment (total distance / time)
  // Then request a certain number of seconds from the segments.
  var totalDistance = 0;

  for (var i = 0; i < coordinates.length; i++) {
    const startPt = { latitude: coordinates[i][LAT], longitude: coordinates[i][LON] };
    const endPt = { latitude: coordinates[i + 1][LAT], longitude: coordinates[i + 1][LON] };
    totalDistance += geolib.getDistance(startPt, endPt);
  }
  // TODO: make the above more functional

  const totalTimeSeconds = (endTime - startTime) / 1000;
  const mPerSecond = totalDistance / totalTimeSeconds;
  const firstSegmentDistance = getfirstSegDistance(startTime, mPerSecond);
  // TODO: use a function to pull enough points off the stack to create a feature from this.
  const result = breakFromMain(coordinates, firstSegmentDistance);

  return buckets;
}

function main (targetFile) {
  var lineReader = new LineByLine('./textFile.txt');

  var hourlyFeatures = new Map();
  while (line = lineReader.next()) {
    var feature = lineHandler(line);
    var tempHourly = bucketToHours(feature);
    tempHourly.forEach((key, value) => hourlyFeatures[key].append(value));
  }
}

module.exports = {
  getSplitPoint: getSplitPoint
};
