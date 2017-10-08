var hour = require('./render_one_hour');
// TODO: Look out for scope issues in this module.

for (item in items) {
  var ms = hour.renderFrame(item, outputLocation);
  console.log(`Processing took ${ms}ms.`)
}
