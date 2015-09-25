var utils = require('./utils'),
    _ = require('lodash');

var poliglo_inputs = {};

poliglo_inputs.get_inputs = function(workflow_instance_data, worker_workflow_data){
    var inputs = worker_workflow_data.default_inputs || {};
    select_inputs = utils.select_dict_el(worker_workflow_data, 'before.select_inputs', {});
    _.each(select_inputs, function(selector, input_key){
        inputs[input_key] = utils.select_dict_el(workflow_instance_data, selector);
    });
    inputs = _.extend(inputs, workflow_instance_data.inputs || {});
    return inputs;
};

// TODO: Manage multiple encoding
poliglo_inputs.get_job_data = function(raw_data){
    return JSON.parse(raw_data);
};

for (var key in poliglo_inputs) {
  exports[key] = poliglo_inputs[key];
}
