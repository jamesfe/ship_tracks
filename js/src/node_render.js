var d3 = require('d3');
var fs = require('fs');

var boundingBox = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -104.765625,
              11.867350911459308
            ],
            [
              -48.515625,
              11.867350911459308
            ],
            [
              -48.515625,
              44.59046718130883
            ],
            [
              -104.765625,
              44.59046718130883
            ],
            [
              -104.765625,
              11.867350911459308
            ]
          ]
        ]
      }
    };

var showShipTracks = true;
var width =  800;
var height =  600;

var styles = {
  styles: ' .blah { fill: green; stroke: blue; stroke-width: 1px } .lines { fill: none; stroke: red; stroke-width: 2px; }'
}

const D3Node = require('d3-node');
const d3n = new D3Node(styles);      // initializes D3 with container element
//const d3n = new D3Node();      // initializes D3 with container element
var svg = d3n.createSVG(width, height);

fs.readFile('./public/assets/data/countries/countries.geo.json', 'utf-8', function(error, data) {
  if (error) throw error;
  data = JSON.parse(data);
  var features = data.features;

  var projection = d3.geoEquirectangular();
  var path = d3.geoPath(projection);

  projection.fitSize([width, height], boundingBox);
  projection.center([-75, 33]);
  projection.scale(1000);

 svg.append("path")
    .datum({type: "FeatureCollection", features: features})
    .attr("d", path)
    .attr("class", "blah");

  fs.readFile('./public/assets/data/daily/283.json', 'utf-8', function(error, data) {
    if (error) throw error;
    data = JSON.parse(data);
    var lines = data.map(function(a) { return a.geometry; });
    if (showShipTracks === true) {
      svg.append("path")
        .datum({type: "FeatureCollection", features: data})
        .attr("d", path)
        .attr("class", "lines");
    }
    console.log(d3n.svgString());
  });

});

/*
d3.json('./assets/data/daily/283.json', function(error, data) {
// d3.json('./assets/data/10_ship_tracks_2011.json', function(error, data) {
  var features = data.map(function(a) { return a.geometry; });

  //features.forEach(function(a) { debugger; console.log(d3.geo.bounds(a)); });

  var svg = d3.select('#ship_plot'),
    margin = {top: 20, right: 50,bottom: 20, left: 30},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;
   // var projection = d3.geoAlbersUsa().scale(1000);
  var projection = d3.geoEquirectangular();
  console.log(projection.scale());
  var path = d3.geoPath().projection(projection);
  // projection.clipExtent = d3.extent(features.map(function(a) { return path.bounds(a)[0]; }));
  projection.fitExtent([[0,0],[height, width]], boundingBox);
  console.log(projection.scale());
  // projection.fitExtent([[0,0],[height, width]], features[0]);
  var zoom = projection.scale();
  console.log(projection.scale());
  projection.scale(zoom/1000);
  console.log(projection.scale());

  svg.selectAll("path")
  .data(features)
  .enter().append("path")
    .attr("d", path)
    .attr("class", "blah");
 });

*/
