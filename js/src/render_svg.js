var d3 = require('d3');

d3.json('./assets/data/sample.json', function(error, data) {
  if (error) throw error;
  features = 
});

svg.append("path")
    .datum({type: "FeatureCollection", features: features})
    .attr("d", d3.geoPath());
