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

function breakFromMain(tail, distance) {
  /* Given an amount of distance, break up the coordinates into some of that distance
   * plus the tail of remaining distance. */
  var head = [];

  var currentLength = 0;
  var currentIndex = 0;
  while (currentLength < distance) {
    if (currentIndex >= tail.length - 1) { throw 'error'; }
    segLength = geolib.getDistance(fromCoord(tail[currentIndex]), fromCoord(tail[currentIndex]));
    if (currentLength + segLength > distance) {
      // TODO: Break segment
    } else {
      // TODO: add to head
      // TODO: remove from tail
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
  const result = breakFromMain(coordinates, firstSegmentDistance)


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

function connectEdges (inputArray) {
  /* Take a list of vertices and return a list of line objects. */
  var retVals = [];
  for (var i = 0; i < inputArray.length - 1; i++) {
    var d1 = {
      latitude: inputArray[i][LAT],
      longitude: inputArray[i][LON]
    };
    var d2 = {
      latitude: inputArray[i + 1][LAT],
      longitude: inputArray[i + 1][LON]
    };

    var distance = geolib.getDistance(d1, d2);
    // TODO: Infer from the total segment how many m/s the ship was traveling.
    var seconds = (inputArray[i + 1].datetime - inputArray[i].datetime) / 1000;
    if (seconds <= 0) {
      seconds = 0.1;
    }
    if (distance <= 0) {
      distance = 0.1;
    }

    var newItem = {
      startPoint: inputArray[i],
      stopPoint: inputArray[i + 1],
      distance: distance,
      seconds: seconds
    };
    retVals.push(newItem);
  }
  return retVals;
}

function splitSegment (seg, seconds) {
  /* Split the segment by removing the first n seconds. Return two new lightweight objects. */
  if (seg.seconds <= seconds) {
    throw 'bad split value';
  }

  var ratio = (seconds / seg.seconds);
  return [
    {
      distance: seg.distance * ratio,
      seconds: seconds
    },
    {
      distance: seg.distance * (1 - ratio),
      seconds: seg.seconds - seconds
    }
  ];
}

function makeBuckets (items, numBuckets) {
  /* Returns an array of items with length numBuckets */
  numBuckets = Math.floor(numBuckets);
  // Do not modify the original array.  Copy it.

  var segs = [];
  for (var k = 0; k < items.length; k++) {
    segs.push({
      distance: items[k].distance,
      seconds: items[k].seconds,
      startPoint: {
        datetime: items[k].startPoint.datetime
      },
      stopPoint: {
        datetime: items[k].stopPoint.datetime
      }
    });
  }

  var retVals = new Array(numBuckets);
  var secondsPerBucket = Math.floor((segs[segs.length - 1].stopPoint.datetime - segs[0].startPoint.datetime) / (numBuckets * 1000));
  var currSeg = 0;

  // We use this as the first moment in the race.
  var startDate = new Date(segs[0].startPoint.datetime);

  for (var i = 0; i < numBuckets; i++) {
    var secondsToGet = secondsPerBucket;
    var componentSegs = []; // The segments we are about to aggregate
    while (secondsToGet > 0) {
      // If we can easily add it, just do so.
      if (segs[currSeg].seconds <= secondsToGet) {
        componentSegs.push(segs[currSeg]);
        secondsToGet -= segs[currSeg].seconds; // decrement things
        currSeg += 1;
      } else {
      // We split this segment up appropriately and then add part of it to this and modify the sitting segment
        var brokenSeg = splitSegment(segs[currSeg], secondsToGet);
        secondsToGet -= brokenSeg[0].seconds; // decrement counter again
        componentSegs.push(brokenSeg[0]);
        segs[currSeg] = brokenSeg[1];
      }
    }

    // Now, we deal with combining the segments.
    if (componentSegs.length === 1) {
      retVals[i] = componentSegs[0];
    } else {
      var distance = componentSegs.reduce(function (s, v) {
        return (s + v.distance);
      }, 0);
      var seconds = componentSegs.reduce(function (s, v) {
        return (s + v.seconds);
      }, 0);
      // Set the value to the sum of everything.
      retVals[i] = {
        distance: distance,
        seconds: seconds
      };
    }
  }

  // Given an array of nearly final data, make it into graphable speeds.
  var speeds = retVals.map(function (a, i) {
    var dt = new Date();
    dt.setTime(startDate.getTime() + (i * secondsPerBucket * 1000));
    return {
      value: (a.distance / a.seconds),
      date: dt
    };
  });
  return speeds;
}
