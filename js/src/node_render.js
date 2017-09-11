var d3 = require('d3');
var fs = require('fs');

var boundingBox = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [ -104.765625, 11.867350911459308 ],
            [ -48.515625, 11.867350911459308 ],
            [ -48.515625, 44.59046718130883 ],
            [ -104.765625, 44.59046718130883 ],
            [ -104.765625, 11.867350911459308 ]
          ]
        ]
      }
    };

function pad(n) {
  if (n < 10) {
    return ("00" + n); }
  else {
    return (n < 100) ? ("0" + n) : n;
  }
}

function addDays(days) {
  var dat = new Date(2013, 0, 0);
  dat.setDate(dat.getDate() + days);

  return dat;
}

var generateDay = parseInt(process.argv[2]);
if (generateDay === undefined) {
  throw Error('no day');
}

var outputDay = pad(generateDay);

var showShipTracks = true;
var showCountries = true;
var width =  800;
var height =  800;

var styles = {
  styles: ' .blah { fill: #8c8e91; stroke: #2c2d2d; stroke-width: 2px } .lines { fill: none; stroke: #4c6363; stroke-width: .5px; } .sea { fill: #88baea; } .bord { fill: none; stroke: black; stroke-width: 10px; }'
}

const D3Node = require('d3-node');
const d3n = new D3Node(styles);      // initializes D3 with container element
var svg = d3n.createSVG(width, height);

svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)
  .attr("class", "sea");

var month = addDays(generateDay).getMonth() + 1;
var day = addDays(generateDay).getDate();

var dstring = `${month}/${day}/2013`;
svg.append("text")
  .attr("x", width-10)
  .attr("y", height-10)
  .attr("font-family", "Roboto, sans-serif")
  .attr("font-size", "36px")
  .attr("text-anchor", "end")
  .attr("fill", "black")
  .text(dstring);

var countriesFile = './public/assets/data/countries/countries.geo.json';
// var countriesFile = './public/assets/data/countries/cuba_2.geo.json';
//var countriesFile = './public/assets/data/countries/usa_4.geo.json';
//var countriesFile = './public/assets/data/countries/selected.geojson';

fs.readFile(countriesFile, 'utf-8', function(error, data) {
  if (error) throw error;
  data = JSON.parse(data);
  var features = data.features;

  var projection = d3.geoEquirectangular();
  var path = d3.geoPath(projection);

  projection.fitSize([width, height], boundingBox);
  projection.center([-72, 34]);
  projection.scale(2000);

  if (showCountries === true) {
    svg.append("path")
      .datum({type: "FeatureCollection", features: features})
      .attr("d", path)
      .attr("class", "blah");
  }

  fs.readFile(`./public/assets/data/daily/${generateDay}.json`, 'utf-8', function(error, data) {
    if (error) throw error;
    data = JSON.parse(data);
    var lines = data.map(function(a) { return a.geometry; });
    if (showShipTracks === true) {
      svg.append("path")
        .datum({type: "FeatureCollection", features: data})
        .attr("d", path)
        .attr("class", "lines");
    }

    /* Now we render some hurricanes. */
    var hurricaneFile = './public/assets/data/hurricanes.geojson';
    fs.readFile(hurricaneFile, 'utf-8', function(herror, hdata) {
      if (herror) throw herror;
      var hurricaneData = JSON.parse(hdata);

      var checkDate = function(obj) {
        if ((parseInt(obj.properties.day) ===  day) && (parseInt(obj.properties.month)  === month)) {
          return true;
        }
        return false;
      }

      var hfeatures = hurricaneData.filter(checkDate);

      svg.selectAll("circle4")
        .data(hfeatures).enter()
        .append("circle")
        .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
        .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
        .attr("r", function (d) { return (d.properties.windspeed/3) + "px"; })
        .attr("fill", "#e04314")

      svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("class", "bord");

      const svg2png = require("svg2png");
        svg2png(d3n.svgString())
          .then(buffer => fs.writeFileSync(`./output/${outputDay}.png`, buffer))
          .catch(e => console.error(e));
    });
  });
});
