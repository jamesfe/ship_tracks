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

d3.json('./assets/data/countries/countries.geo.json', function(error, data) {
  if (error) throw error;
  var features = data.features;
  var svg = d3.select('#ship_plot'),
    margin = {top: 20, right: 50,bottom: 20, left: 30},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

  // var projection = d3.geoEquirectangular();
  // var path = d3.geoPath().projection(projection);
  // projection.fitExtent([[0,0],[height, width]], boundingBox);
  // var projection = d3.geoAlbers();
  var projection = d3.geoEquirectangular();
  var path = d3.geoPath(projection);

  console.log(projection.clipExtent());
  // projection.clipExtent(d3.extent(features.map(function(a) { return path.bounds(a)[0]; })));
  // projection.fitSize([height, width], boundingBox);
  projection.fitSize([width, height], boundingBox);
  projection.center([-75, 25]);
  projection.scale(400);
  console.log('zoom: ', projection.scale());
  console.log(projection.clipExtent());
  console.log(projection.center());
/*
  svg.append("path")
    .datum({type: "FeatureCollection", features: features})
    .attr("d", path)
    .attr("class", "blah");
*/
  d3.json('./assets/data/daily/283.json', function(error, data) {
    if (error) throw error;
    var lines = data.map(function(a) { return a.geometry; });
    svg.append("path")
      .datum({type: "FeatureCollection", features: data})
      .attr("d", path)
      .attr("class", "lines");
    console.log("Done");
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
