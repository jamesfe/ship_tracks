const startTime = Date.now()
const D3Node = require('d3-node');
var d3 = require('d3');
var fs = require('fs');
var turf = require('@turf/turf');
const svg2png = require("svg2png");

function saveImage(outputLoc, svgString) {
  console.log(`outputting to ${outputLoc}`);
  svg2png(svgString)
    .then(buffer => fs.writeFileSync(outputLoc, buffer))
    .catch(e => console.error(e));
}

function drawBox(svg, width, height) {
  /* Draw a box around everything. */
  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bord");
}

function drawOcean(svg, width, height) {
  svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("class", "sea");
}

function addDateText(svg, width, height, dstring) {
  svg.append("text")
    .attr("x", width-10)
    .attr("y", height-10)
    .attr("font-family", "Roboto, sans-serif")
    .attr("font-size", "36px")
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .text(dstring);
}

var boundingBox = {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [ [ [ -104.765625, 11.867350911459308 ],
            [ -48.515625, 11.867350911459308 ],
            [ -48.515625, 44.59046718130883 ],
            [ -104.765625, 44.59046718130883 ],
            [ -104.765625, 11.867350911459308 ] ] ]
      }
    };


var harborBoundingArea = [-74.4, 40.33, -73.75, 40.885];

function pad(n) {
  /* Pad a number up to 3 spaces */
  if (n < 10) {
    return ("00" + n); }
  else {
    return (n < 100) ? ("0" + n) : n;
  }
}

/* TODO: Curry this */
function addDays(days) {
  /* Add a certain number of days to the first of 2013 */
  var dat = new Date(2013, 0, 0);
  dat.setDate(dat.getDate() + days);
  return dat;
}

function julianToCalendarFormat(ival) {
  /* Take an int from 1-366 and convert it to a day of the year */
  const dt = addDays(ival);
  const day = dt.getDate();
  const month = dt.getMonth() + 1;
  const year = 2013;
  return `${year}-${month}-${day}`;
}

function main() {
  /* Parse arguments */
  const generateDay = parseInt(process.argv[2]);
  const targetHour = parseInt(process.argv[3]);
  const dateFormattedForFile = julianToCalendarFormat(generateDay);
  if (generateDay === undefined) {
    throw Error('no day');
  }
  if (targetHour === undefined) {
    throw ERror('no hour');
  }

  /* Viewport settings */
  /* All of the ocean
  const scale = 2000;       // some arbitrary number
  const center = [-72, 34]; // in Long, Lat format
   */
  // const scale = 10000;
  // const center = [-73.689, 40.372]; // nyc
  // const center = [-73.8395, 40.564702]; const scale = 40000; // NYC large view
  // const center = [-73.9398, 40.5055]; const scale = 110000;     // Focus on outer NY harbor
  const center = [-74.0333747,40.685949]; const scale = 270000; // manhattan harbor
  /*
  if (process.argv[3] !== undefined) {
    center = process.argv[3].split(',').map(_ => parseFloat(_))
  }
  if (process.argv[4] !== undefined) {
    scale = parseInt(process.argv[4])
  } */

  const year = '2013'
  // const countriesFile = '../data/countries/countries.geo.json';
  // const countriesFile = '../data/just_ny_area.geojson';
  const countriesFile = '../data/countries/just_nyc_area_maritime_osm.geojson';
  const fileTail = `${dateFormattedForFile}-${targetHour}.geo.json`
  const tgt_day_file = `../data/hourly_${year}/${fileTail}`
  // const tgt_day_file = `../data/2011daily/${generateDay}.json`
  const hurricaneFile = '../data/hurricanes.geo.json';

  const outputDay = pad(generateDay);
  const outputLocation = `../output/${year}_hourly/${fileTail}.png`

  const showHurricanes = false;
  const showShipTracks = true;
  const showCountries = true;
  const width =  800;
  const height =  800;
  const month = addDays(generateDay).getMonth() + 1;
  const day = addDays(generateDay).getDate();
  const dstring = `${month}/${day}/${year}`;

  const styles = {
    styles: `
      .country { fill: #8c8e91; stroke: #2c2d2d; stroke-width: 2px }
      .fullline { fill: none; stroke-opacity: 0.2; stroke: #000000; stroke-width: .3px; }
      .pastline { fill: none; stroke-opacity: 0.05; stroke: #000000; stroke-width: .3px; }
      .sea { fill: #88baea; } .bord { fill: none; stroke: black; stroke-width: 10px; }
      `
  }

  const d3n = new D3Node(styles);
  var svg = d3n.createSVG(width, height);

  drawOcean(svg, width, height);

  /* Draw the country boundaries */
  var countriesFileData = fs.readFileSync(countriesFile, 'utf-8');
  var countryFeatures = JSON.parse(countriesFileData).features;

  var projection = d3.geoEquirectangular();
  var path = d3.geoPath(projection);

  projection.fitSize([width, height], boundingBox);
  projection.center(center).scale(scale);
  console.log(`Center: ${projection.center()} Scale: ${projection.scale()}`);

  if (showCountries === true) {
    svg.append("path")
      .datum({type: "FeatureCollection", features: countryFeatures})
      .attr("d", path)
      .attr("class", "country");
  }

  addDateText(svg, width, height, dstring);

  /*
  if (generateDay > 1) {
    const previousDay = `../data/daily_${year}/${generateDay - 1}.json`
    var shipFileData = fs.readFileSync(previousDay, 'utf-8');
    shipData = JSON.parse(shipFileData);
    var lines = shipData.map(function(a) { return a.geometry; });
    if (showShipTracks === true) {
      svg.append("path")
        .datum({type: "FeatureCollection", features: shipData})
        .attr("d", path)
        .attr("class", "pastline");
    }
  }
  */

  /* Read the ship lines file synchronously */
  console.log('Reading: ', tgt_day_file);
  var shipFileData = fs.readFileSync(tgt_day_file, 'utf-8');
  const shipData = shipFileData.split('\n').map(x => {
    var t = undefined;
    try { t = JSON.parse(x) }
    catch(_) { return undefined }
    return t}).filter(x => x != undefined);
  let prevLines = shipData.length;
  var lines = shipData.map(a => turf.bboxClip(a, harborBoundingArea)).filter(a => a.geometry.coordinates.length > 0);
  if (showShipTracks === true) {
    console.log(`From ${prevLines} showing ${lines.length} a decrease of ${lines.length - prevLines}`);
    // This is where we draw the lines onto the map
    svg.append("path")
      .datum({type: "FeatureCollection", features: lines })
      .attr("d", path)
      .attr("class", "fullline");
  }

  /* Now render some hurricanes. */
  if (showHurricanes === true) {
    function checkDate(obj) {
      if ((parseInt(obj.properties.day) ===  day) && (parseInt(obj.properties.month)  === month)) {
        return true;
      }
      return false;
    }
    const hurricaneData = JSON.parse(fs.readFileSync(hurricaneFile, 'utf-8'));
    const hfeatures = hurricaneData.filter(checkDate);
    svg.selectAll("circle4")
      .data(hfeatures).enter()
      .append("circle")
      .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
      .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
      .attr("r", function (d) { return (d.properties.windspeed/3) + "px"; })
      .attr("fill", "#e04314")
  }

  drawBox(svg, width, height);
  let debugSave = false;
  if (debugSave === true) {
    fs.writeFile("./test_output.svg", d3n.svgString(), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The test SVG was saved!");
    });
  }
  saveImage(outputLocation, d3n.svgString());
}

main();

const endTime = Date.now()
console.log(`Processing took ${endTime - startTime}ms.`)
