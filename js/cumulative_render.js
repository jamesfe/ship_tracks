const startTime = Date.now();
const D3Node = require('d3-node');
var d3 = require('d3');
var fs = require('fs');
const svg2png = require('svg2png');

const width = 800;
const height = 800;
const styles = {
  styles: `
    .country { fill: #8c8e91; stroke: #2c2d2d; stroke-width: 2px }
    .fullline { fill: none; stroke-opacity: 0.2; stroke: #000000; stroke-width: .3px; }
    .pastline { fill: none; stroke-opacity: 0.05; stroke: #000000; stroke-width: .3px; }
    .sea { fill: #88baea; } .bord { fill: none; stroke: black; stroke-width: 10px; }
    `
};
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
const center = [-74.0333747, 40.685949];
const scale = 270000; // manhattan harbor

const d3n = new D3Node(styles);
var svg = d3n.createSVG(width, height);
var projection = d3.geoEquirectangular();
var path = d3.geoPath(projection);

projection.fitSize([width, height], boundingBox);
projection.center(center).scale(scale);
console.log(`Center: ${projection.center()} Scale: ${projection.scale()}`);

function saveImage (outputLoc, svgString) {
  console.log(`outputting to ${outputLoc}`);
  svg2png(svgString)
    .then(buffer => fs.writeFileSync(outputLoc, buffer))
    .catch(e => console.error(e));
}

function drawBox (svg) {
  /* Draw a box around everything. */
  svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'bord');
}

function drawOcean (svg) {
  svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'sea');
}

function addDateText (svg, dstring) {
  svg.append('text')
    .attr('x', width - 10)
    .attr('y', height - 10)
    .attr('font-family', 'Roboto, sans-serif')
    .attr('font-size', '36px')
    .attr('text-anchor', 'end')
    .attr('fill', 'black')
    .text(dstring);
}

function pad (n) {
  /* Pad a number up to 3 spaces */
  if (n < 10) {
    return ('00' + n);
  } else {
    return (n < 100) ? ('0' + n) : n;
  }
}

function addDays (days) {
  /* Add a certain number of days to teh first of 2013 */
  var dat = new Date(2013, 0, 0);
  dat.setDate(dat.getDate() + days);
  return dat;
}

function createBaseFrame () {
  const countriesFile = '../data/countries/just_nyc_area_maritime_osm.geojson';

  const showCountries = true;

  drawOcean(svg);

  /* Draw the country boundaries */
  var countriesFileData = fs.readFileSync(countriesFile, 'utf-8');
  var countryFeatures = JSON.parse(countriesFileData).features;

  if (showCountries === true) {
    svg.append('path')
      .datum({type: 'FeatureCollection', features: countryFeatures})
      .attr('d', path)
      .attr('class', 'country');
  }
}

function addSpecificDay (generateDay) {
  const year = '2013';
  const tgtDayFile = `../data/daily_${year}/${generateDay}.json`;
  const outputDay = pad(generateDay);
  const month = addDays(generateDay).getMonth() + 1;
  const day = addDays(generateDay).getDate();
  const dstring = `${month}/${day}/${year}`;
  const outputLocation = `../output/${year}/cumulative/${outputDay}.png`;

  addDateText(svg, dstring);

  /* Read the ship lines file synchronously */
  var shipFileData = fs.readFileSync(tgtDayFile, 'utf-8');
  const shipData = JSON.parse(shipFileData);
  svg.append('path')
    .datum({type: 'FeatureCollection', features: shipData})
    .attr('d', path)
    .attr('class', 'fullline');
  return (outputLocation);
}

function finishFrame () {
  drawBox(svg);
  return (svg);
}

createBaseFrame();
for (var day = 1; day < 11; day++) {
  var outputLocation = addSpecificDay(day);
  finishFrame();
  saveImage(outputLocation, d3n.svgString());
}

const endTime = Date.now();
console.log(`Processing took ${endTime - startTime}ms.`);
