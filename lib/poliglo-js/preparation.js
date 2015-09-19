var redis = require('redis'),
    request = require('request'),
    utils = require('./utils'),
    variables = require('./variables'),
    _ = require('lodash'),
    util = require('util');

var poliglo_preparation = {};

poliglo_preparation.get_connection = function(worker_config, callback){
    var connection = redis.createClient(worker_config.REDIS_PORT, worker_config.REDIS_HOST, {});
    var select_db = worker_config.REDIS_DB || 0;
    connection.select(select_db, function(err){
        callback(err, connection);
    });
};

poliglo_preparation.get_config = function(master_mind_url, meta_worker, callback){
    var target_url = util.format(
        variables.POLIGLO_SERVER_URL_WORKER_CONFIG, master_mind_url, meta_worker
    );
    request.get(target_url, function (error, response, body) {
        callback(error, utils.json_loads(body));
    });
};
poliglo_preparation.get_worker_workflow_data = function(
    worker_workflows, workflow_instance_data, worker_id
){
    var worker_workflow_data = worker_workflows[
        utils.select_dict_el(workflow_instance_data, 'workflow_instance.workflow') || {}
    ][worker_id] || {};
    if(!worker_workflow_data)
        worker_workflow_data = {};
    return _.cloneDeep(worker_workflow_data);
};
poliglo_preparation.prepare_worker = function(master_mind_url, meta_worker, callback){
    var target_url = util.format(
        variables.POLIGLO_SERVER_URL_WORKER_WORKFLOWS, master_mind_url, meta_worker
    );
    // TODO: add async
    request.get(target_url, function (error, response, body) {
        var worker_workflows = utils.json_loads(body);
        poliglo_preparation.get_config(master_mind_url, meta_worker, function(
            error_conf, worker_config
        ){
            poliglo_preparation.get_connection(
                worker_config,
                function(error_conn, connection){
                    callback(error_conn, {worker_workflows: worker_workflows, connection: connection});
                }
            );
        });
    });
};
// TODO: callbacks

for (var key in poliglo_preparation) {
  exports[key] = poliglo_preparation[key];
}
