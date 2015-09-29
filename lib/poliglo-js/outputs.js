var _ = require('lodash'),
    util = require('util'),
    uuid = require('node-uuid'),
    status = require('./status'),
    utils = require('./utils'),
    variables = require('./variables'),
    async = require("async");

var poliglo_outputs = {};

poliglo_outputs.add_data_to_next_worker = function(connection, output, raw_data, callback){
    connection.lpush(util.format(variables.REDIS_KEY_QUEUE, output), raw_data, callback);
};

poliglo_outputs.add_new_job_id = function(connection, workflow, instance_id, worker, job_id){
    connection.sadd(
        util.format(
            variables.REDIS_KEY_INSTANCE_WORKER_JOBS,workflow, instance_id, worker, 'total'
        ), job_id
    );
};

poliglo_outputs.write_one_output = function(
    connection, output_meta_worker, output_worker_id, workflow_instance_data, callback
){
    new_job_id = uuid.v4();
    workflow_instance_data.jobs_ids = (workflow_instance_data.jobs_ids || []).concat([new_job_id]);
    workflow_instance_data.workflow_instance.worker_id = output_worker_id;
    workflow_instance_data.workflow_instance.meta_worker = output_meta_worker;
    poliglo_outputs.add_new_job_id(
        connection,
        workflow_instance_data.workflow_instance.workflow,
        workflow_instance_data.workflow_instance.id,
        output_worker_id,
        new_job_id
    );

    poliglo_outputs.add_data_to_next_worker(
        connection, output_meta_worker, utils.to_json(workflow_instance_data), callback
    );
};
poliglo_outputs.prepare_write_output = function(
    workflow_instance_data, worker_output_data, worker_id
){
    var new_workflow_instance_data = _.cloneDeep(workflow_instance_data);
    if(!new_workflow_instance_data.workflow_instance.workers)
        new_workflow_instance_data.workflow_instance.workers = [];
    new_workflow_instance_data.workflow_instance.workers.push(worker_id);
    if(!new_workflow_instance_data.workers_output)
        new_workflow_instance_data.workers_output = {};
    new_workflow_instance_data.workers_output[worker_id] = worker_output_data;
    new_workflow_instance_data.inputs = worker_output_data;
    return new_workflow_instance_data;
};

poliglo_outputs.write_outputs = function(
    connection, workflow_instance_data, worker_output_data, worker_workflow_data, callback
){
    var new_workflow_instance_data = poliglo_outputs.prepare_write_output(
        workflow_instance_data,
        worker_output_data,
        workflow_instance_data.workflow_instance.worker_id
    );
    status.update_workflow_instance(
        connection,
        new_workflow_instance_data.workflow_instance.workflow,
        new_workflow_instance_data.workflow_instance.id,
        null,
        function(){
            var workers_outputs_types = worker_workflow_data.__next_workers_types || [];
            async.forEachOf(
                worker_workflow_data.next_workers || [],
                function(output_worker_id, i, async_callback){
                    poliglo_outputs.write_one_output(
                        connection, workers_outputs_types[i],
                        output_worker_id, new_workflow_instance_data,
                        async_callback
                    );
                },
                callback
            );
        }
    );
};

poliglo_outputs.write_finalized_job = function(
    connection, workflow_instance_data, worker_output_data, worker_id, callback
){
    var new_workflow_instance_data = poliglo_outputs.prepare_write_output(
        workflow_instance_data, worker_output_data, worker_id
    );
    connection.zadd(
        util.format(
            variables.REDIS_KEY_INSTANCE_WORKER_FINALIZED_JOBS,
            new_workflow_instance_data.workflow_instance.workflow,
            new_workflow_instance_data.workflow_instance.id,
            worker_id
        ),
        Date.now() / 1000,
        utils.to_json(new_workflow_instance_data),
        // TODO: manage errors
        function(){
            connection.lpush(
                variables.REDIS_KEY_QUEUE_FINALIZED,
                utils.to_json({
                    'workflow': new_workflow_instance_data.workflow_instance.workflow,
                    'workflow_instance_id': new_workflow_instance_data.workflow_instance.id,
                    'workflow_instance_name': new_workflow_instance_data.workflow_instance.name || 'untitled',
                    'meta_worker': new_workflow_instance_data.workflow_instance.meta_worker || 'not sure',
                    'worker_id': worker_id
                }),
                function(){
                    if(callback)
                        callback();
                }
            );
        }
    );
};

poliglo_outputs.write_error_job = function(connection, worker_id, raw_data, error, callback){
    var metric_name = 'errors';
    try{
        workflow_instance_data = utils.json_loads(raw_data);
        if(!workflow_instance_data.workers_error){
            workflow_instance_data.workers_error = {};
        }
        workflow_instance_data.workers_error[worker_id] = {
            'error': error.toString(),
            'traceback': error.stack
        };
        metric_name = util.format(variables.REDIS_KEY_INSTANCE_WORKER_ERRORS,
            workflow_instance_data.workflow_instance.workflow,
            workflow_instance_data.workflow_instance.id,
            worker_id
        );
    }
    catch(e){
        workflow_instance_data = {'workers_error': {}, 'raw_data': raw_data};
        workflow_instance_data.workers_error[worker_id] = {
            'error': 'cannot json_loads', 'traceback': error.stack
        };
        metric_name = variables.REDIS_KEY_INSTANCE_WORKER_ERRORS % (
            'unknown', 'unknown', worker_id
        );
    }
    var json_encoded = '';
    try{
        json_encoded = utils.to_json(workflow_instance_data);
    }
    catch(e){
        json_encoded = utils.to_json(workflow_instance_data);
    }
    connection.zadd(metric_name, Date.now() / 1000, json_encoded, callback);
};

for (var key in poliglo_outputs) {
  exports[key] = poliglo_outputs[key];
}
