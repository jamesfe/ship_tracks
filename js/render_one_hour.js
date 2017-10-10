const D3Node = require('d3-node');
var d3 = require('d3');
var fs = require('fs');
const svg2png = require('svg2png');

function saveImage (outputLoc, svgString) {
  console.log(`outputting to ${outputLoc}`);
  svg2png(svgString)
    .then(buffer => fs.writeFileSync(outputLoc, buffer))
    .catch(e => console.error(e));
}

function drawBox (svg, width, height) {
  /* Draw a box around everything. */
  svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'bord');
}

function drawOcean (svg, width, height) {
  svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'sea');
}

function addDateText (svg, width, height, dstring) {
  svg.append('text')
    .attr('x', width - 10)
    .attr('y', height - 10)
    .attr('font-family', 'Roboto, sans-serif')
    .attr('font-size', '36px')
    .attr('text-anchor', 'end')
    .attr('fill', 'black')
    .text(dstring);
}

var boundingBox = {
  'type': 'Feature',
  'geometry': {
    'type': 'Polygon',
    'coordinates': [ [ [ -104.765625, 11.867350911459308 ],
      [ -48.515625, 11.867350911459308 ],
      [ -48.515625, 44.59046718130883 ],
      [ -104.765625, 44.59046718130883 ],
      [ -104.765625, 11.867350911459308 ] ] ]
  }
};

function pad (n) {
  /* Pad a number up to 3 spaces */
  if (n < 10) {
    return ('00' + n);
  } else {
    return (n < 100) ? ('0' + n) : n;
  }
}

/* TODO: Curry this */
function addDays (days) {
  /* Add a certain number of days to teh first of 2013 */
  var dat = new Date(2013, 0, 0);
  dat.setDate(dat.getDate() + days);
  return dat;
}

function main () {
  /* Parse arguments */
  const generateDay = parseInt(process.argv[2]);
  if (generateDay === undefined) {
    throw Error('no day');
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
  var center = [-74.0333747, 40.685949]; var scale = 270000; // manhattan harbor
  if (process.argv[3] !== undefined) {
    center = process.argv[3].split(',').map(_ => parseFloat(_));
  }
  if (process.argv[4] !== undefined) {
    scale = parseInt(process.argv[4]);
  }

  const year = '2013';
  // const countriesFile = '../data/countries/countries.geo.json';
  // const countriesFile = '../data/just_ny_area.geojson';
  const countriesFile = '../data/countries/just_nyc_area_maritime_osm.geojson';
  const tgt_day_file = `../data/daily_${year}/${generateDay}.json`;
  // const tgt_day_file = `../data/2011daily/${generateDay}.json`

  const outputDay = pad(generateDay);
  const outputLocation = `../output/${year}/hourly/${outputDay}.png`;

  const showShipTracks = true;
  const showCountries = true;
  const width = 800;
  const height = 800;
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
    svg.append('path')
      .datum({type: 'FeatureCollection', features: countryFeatures})
      .attr('d', path)
      .attr('class', 'country');
  }

  addDateText(svg, width, height, dstring);

  if (generateDay > 1) {
    const previousDay = `../data/daily_${year}/${generateDay - 1}.json`;
    var shipFileData = fs.readFileSync(previousDay, 'utf-8');
    var shipData = JSON.parse(shipFileData);
    if (showShipTracks === true) {
      svg.append('path')
        .datum({type: 'FeatureCollection', features: shipData})
        .attr('d', path)
        .attr('class', 'pastline');
    }
  }

  /* Read the ship lines file synchronously */
  var currentShipFileData = fs.readFileSync(tgt_day_file, 'utf-8');
  shipData = JSON.parse(currentShipFileData);
  if (showShipTracks === true) {
    svg.append('path')
      .datum({type: 'FeatureCollection', features: shipData})
      .attr('d', path)
      .attr('class', 'fullline');
  }

  drawBox(svg, width, height);

  saveImage(outputLocation, d3n.svgString());
}

function generateHourlyInputFileName (directory, dateObj) {
  const fileName = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}-${dateObj.getHours()}.geo.json`;
  const fName = path.join(directory, fileName);
  return fName;
}

function generateHourlyOutputFileName (directory, dateObj) {
  // const fileName = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}-${dateObj.getHours()}.png`;
  const fileName = `${dateObj.getTime()}.png`;
  const fName = path.join(directory, fileName);
  return fName;
}

function renderFrame (dataDir, outputDir, targetHour) {
  const startTime = Date.now();

  var center = [-74.0333747, 40.685949]; var scale = 270000; // manhattan harbor
  const countriesFile = '../data/countries/just_nyc_area_maritime_osm.geojson';
  const inFile = generateHourlyInputFileName(dataDir, targetHour);
  const outputLocation = generateHourlyOutputFileName(outputDir, targetHour);
  const width = 800;
  const height = 800;

  // TODO
  // const dstring = `${month}/${day}/${year}`;
  const d3n = new D3Node(styles);
  var svg = d3n.createSVG(width, height);

  drawOcean(svg, width, height);

  /* Draw the country boundaries */
  var countriesFileData = fs.readFileSync(countriesFile, 'utf-8');
  var countryFeatures = JSON.parse(countriesFileData).features;

  var projection = d3.geoEquirectangular();
  var path = d3.geoPath(projection);

  // TODO: Get rid of this somehow
  projection.fitSize([width, height], boundingBox);
  projection.center(center).scale(scale);
  console.log(`Center: ${projection.center()} Scale: ${projection.scale()}`);

  svg.append('path')
    .datum({type: 'FeatureCollection', features: countryFeatures})
    .attr('d', path)
    .attr('class', 'country');

  if (fs.existsSync(inFile)) {
    var currentShipFileData = fs.readFileSync(inFile, 'utf-8');
    const shipData = currentShipFileData.split('\n').map(blah => {
      if (blah.length > 0) {
        return JSON.parse(blah);
      }
    }).filter(n => n !== undefined);
    svg.append('path')
      .datum({type: 'FeatureCollection', features: shipData})
      .attr('d', path)
      .attr('class', 'fullline');
  }

  drawBox(svg, width, height);
  saveImage(outputLocation, d3n.svgString());

  console.log(inFile);
  const endTime = Date.now();
  return (endTime - startTime);
}

module.exports = {
  renderFrame: renderFrame
};
