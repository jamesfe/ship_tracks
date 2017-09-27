const startTime = Date.now()
const D3Node = require('d3-node');
var d3 = require('d3');
var fs = require('fs');

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
  /* Add a certain number of days to teh first of 2013 */
  var dat = new Date(2013, 0, 0);
  dat.setDate(dat.getDate() + days);
  return dat;
}

function main() {
  /* Parse arguments */
  const generateDay = parseInt(process.argv[2]);
  if (generateDay === undefined) {
    throw Error('no day');
  }
  const year = '2013'
  // const countriesFile = '../data/countries/countries.geo.json';
  const countriesFile = '../data/just_ny_area.geojson';
  const tgt_day_file = `../data/daily_${year}/${generateDay}.json`
  // const tgt_day_file = `../data/2011daily/${generateDay}.json`
  const hurricaneFile = '../data/hurricanes.geo.json';

  const outputDay = pad(generateDay);
  const outputLocation = `../output/${year}/${outputDay}.png`

  /* Viewport settings */
  /* All of the ocean
  const scale = 2000;       // some arbitrary number
  const center = [-72, 34]; // in Long, Lat format
   */
  // const scale = 10000;
  // const center = [-73.689, 40.372]; // nyc
  const center = [-73.8395, 40.564702]; const scale = 40000;

  const showHurricanes = true;
  const showShipTracks = true;
  const showCountries = true;
  const width =  800;
  const height =  800;
  const month = addDays(generateDay).getMonth() + 1;
  const day = addDays(generateDay).getDate();
  const dstring = `${month}/${day}/${year}`;

  const styles = {
    styles: ' .blah { fill: #8c8e91; stroke: #2c2d2d; stroke-width: 2px } .lines { fill: none; stroke: #4c6363; stroke-width: .5px; } .sea { fill: #88baea; } .bord { fill: none; stroke: black; stroke-width: 10px; }'
  }

  const d3n = new D3Node(styles);
  var svg = d3n.createSVG(width, height);

  drawOcean(svg, width, height);
  addDateText(svg, width, height, dstring);

  /* Draw the country boundaries */
  var countriesFileData = fs.readFileSync(countriesFile, 'utf-8');
  var features = JSON.parse(countriesFileData).features;

  var projection = d3.geoEquirectangular();
  var path = d3.geoPath(projection);

  projection.fitSize([width, height], boundingBox);
  projection.center(center).scale(scale);
  console.log(`Center: ${projection.center()} Scale: ${projection.scale()}`);

  if (showCountries === true) {
    svg.append("path")
      .datum({type: "FeatureCollection", features: features})
      .attr("d", path)
      .attr("class", "blah");
  }

  /* Read the ship lines file synchronously */
  var shipFileData = fs.readFileSync(tgt_day_file, 'utf-8');
  shipData = JSON.parse(shipFileData);
  var lines = shipData.map(function(a) { return a.geometry; });
  if (showShipTracks === true) {
    svg.append("path")
      .datum({type: "FeatureCollection", features: shipData})
      .attr("d", path)
      .attr("class", "lines");
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

  /* Output a SVG in PNG format. */
  console.log(`outputting to ${outputLocation}`);
  const svg2png = require("svg2png");
    svg2png(d3n.svgString())
      .then(buffer => fs.writeFileSync(outputLocation, buffer))
      .catch(e => console.error(e));
}

main();


const endTime = Date.now()
console.log(`Processing took ${endTime - startTime}ms.`)
