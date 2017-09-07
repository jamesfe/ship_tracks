var d3 = require('d3');

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


d3.json('./assets/data/10k_ship_data.json', function(error, data) {
// d3.json('./assets/data/10_ship_tracks_2011.json', function(error, data) {
  if (error) throw error;
  var features = data.map(function(a) { return a.geometry; });

  //features.forEach(function(a) { debugger; console.log(d3.geo.bounds(a)); });

  var svg = d3.select('#ship_plot'),
    margin = {top: 20, right: 50,bottom: 20, left: 30},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;
  /*
  var projection = d3.geoMercator();
  projection
    .scale(200)
    .center([-72, 30]);
  */
  // var projection = d3.geoAlbersUsa().scale(1000);
  var projection = d3.geoEquirectangular();
  console.log(projection.scale());
  var path = d3.geoPath().projection(projection);
  // projection.clipExtent = d3.extent(features.map(function(a) { return path.bounds(a)[0]; }));
  projection.fitExtent([[0,0],[height, width]], boundingBox);
  // projection.fitExtent([[0,0],[height, width]], features[0]);
  console.log(projection.scale());
  console.log(projection.scale());

  svg.selectAll("path")
  .data(features)
  .enter().append("path")
    .attr("d", path)
    .attr("class", "blah");
 });
