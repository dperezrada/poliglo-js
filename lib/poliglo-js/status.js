var variables = require('./variables'),
    _ = require('lodash'),
    util = require('util'),
    async = require('async');

var poliglo_status = {};

poliglo_status.update_done_jobs = function(
    connection, workflow, instance_id, worker_id, job_id, start_time, callback
){

    connection
        .sadd(
            util.format(
                variables.REDIS_KEY_INSTANCE_WORKER_JOBS, workflow, instance_id, worker_id, 'done'
            ),
            job_id,
            function(){
                connection.lpush(
                    util.format(variables.REDIS_KEY_INSTANCE_WORKER_TIMING, workflow, instance_id, worker_id),
                    Date.now() / 1000 - start_time,
                    callback
                );
            }
        );
};

poliglo_status.update_workflow_instance = function(
    connection, workflow, workflow_instance_id, workflow_instance_data, callback
){
    if(!workflow_instance_data)
        workflow_instance_data = {};
    workflow_instance_data.update_time = Date.now() / 1000;
    // TODO: change this to multi
    // var pipe = connection.multi();
    async.forEachOf(
        workflow_instance_data,
        function(value, key, async_callback){
            connection.hset(
                util.format(variables.REDIS_KEY_ONE_INSTANCE, workflow, workflow_instance_id),
                key,
                value,
                async_callback
            );
        },
        callback
    );
    // TODO: manage eventual errors
    // pipe.exec(callback);
};

poliglo_status.get_workflow_instance_key = function(
    connection, workflow, workflow_instance_id, key, callback
){
    connection.hget(
        util.format(variables.REDIS_KEY_ONE_INSTANCE, workflow, workflow_instance_id),
        key,
        callback
    );
};

poliglo_status.update_workflow_instance_key = function(
    connection, workflow, workflow_instance_id, key, value, callback
){
    connection.hset(
        util.format(variables.REDIS_KEY_ONE_INSTANCE, workflow, workflow_instance_id),
        key,
        value,
        callback
    );
};
poliglo_status.workflow_instance_exists = function(
    connection, workflow, workflow_instance_id, callback
){
    connection.exists(
        util.format(variables.REDIS_KEY_ONE_INSTANCE, workflow, workflow_instance_id), callback
    );
};

poliglo_status.stats_add_new_instance = function(
    connection, workflow, workflow_instance_info, callback
){
    connection.zadd(
        util.format(variables.REDIS_KEY_INSTANCES, workflow),
        Date.now() / 1000, to_json(workflow_instance_info), callback
    );
};

for (var key in poliglo_status) {
  exports[key] = poliglo_status[key];
}
