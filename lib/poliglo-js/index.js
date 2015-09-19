var poliglo = {};
poliglo.inputs = require('./inputs');
poliglo.utils = require('./utils');
poliglo.preparation = require('./preparation');
poliglo.variables = require('./variables');
poliglo.outputs = require('./outputs');
poliglo.status = require('./status');
poliglo.start = require('./start');
poliglo.runner = require('./runner');

for (var key in poliglo) {
  exports[key] = poliglo[key];
}
