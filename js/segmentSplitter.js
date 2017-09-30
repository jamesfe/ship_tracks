/*
 * First: This is a world of [lat, lon] coordinates.
 * */

var fs = require('fs');
var geolib = require('geolib');
var lineByLine = require('n-readlines');

function lineHandler (line) {
  /*
   * Input: A line which is valid JSON and a valid GeoJSON line geometry
   * Output: A map containing time keys (ex below) and valid GeoJSON geometries
   * Time Key: YYYY-MM-DD-HH_to_YYYY-MM-DD-HH
   * */
  console.log(line);
}

function bucketToHours (inString) {
  var feature = JSON.parse(inString);
  return (feature);
}

function main (targetFile) {
  var lineReader = new lineByLine('./textFile.txt');

  var hourlyFeatures = new Map();
  while (line = lineReader.next()) {
    var tempHourly = bucketToHours(line);
    tempHourly.forEach((key, value) => hourlyFeatures[key].append(value));
  }
}

function connectEdges (inputArray) {
  /* Take a list of vertices and return a list of line objects. */
  var retVals = [];
  for (var i = 0; i < inputArray.length - 1; i++) {
    var d1 = {
      latitude: inputArray[i].lat,
      longitude: inputArray[i].lon
    };
    var d2 = {
      latitude: inputArray[i + 1].lat,
      longitude: inputArray[i + 1].lon
    };

    var distance = geolib.getDistance(d1, d2);
    var seconds = (inputArray[i + 1].datetime - inputArray[i].datetime) / 1000;
    if (seconds <= 0) {
      seconds = 0.1;
    }
    if (distance <= 0) {
      distance = 0.1;
    }

    var newItem = {
      startPoint: inputArray[i],
      stopPoint: inputArray[i+1],
      distance: distance,
      seconds: seconds
    };
    retVals.push(newItem);
  }
  return retVals;
}

function loadDataAndSegment () {
  var edges;
  d3.xml('./data/jfk50miler.gpx', function (error, data) {
    if (error) throw error;
    data = [].map.call(data.querySelectorAll('trkpt'), function (point) {
      return {
        lat: parseFloat(point.getAttribute('lat')),
        lon: parseFloat(point.getAttribute('lon')),
        elevation: parseFloat(point.querySelector('ele').textContent),
        datetime: addSeconds(new Date(point.querySelector('time').textContent), -1 * 5 * 3600),
        hr: parseInt(point.querySelector('extensions').childNodes[1].childNodes[1].textContent)
      };
    });
    data.sort(function (b, a){
      return new Date(b.datetime) - new Date(a.datetime);
    });
    edges = connectEdges(data);
    // edges contains a list of starting and ending times plus distance gone and seconds
    renderSegmentedGraph(edges, 'running_segments', 98, edges[0].startPoint.datetime);
  });
  return edges;
}

function addSeconds (item, seconds) {
  /* Add seconds to a date object and return a new date. */
  if (item instanceof Date === false) { throw "not given a date"; }
  var newDate = new Date();
  newDate.setTime(item.getTime() + (seconds * 1000));
  return newDate;
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
    },
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


main();
