var crypto = require('crypto'),
    status = require('./status'),
    outputs = require('./outputs');

var poliglo_start = {};

poliglo_start.start_workflow_instance = function(
    connection, workflow, start_meta_worker,
    start_worker_id, workflow_instance_name, initial_data
){

        var workflow_instance_id = crypto.createHash('md5').update(
            workflow_instance_name).digest('hex');

        var exists_workflow_instance_before = status.workflow_instance_exists(
            connection, workflow, workflow_instance_id
        );
        var workflow_instance_data = {
            'workflow': workflow,
            'id': workflow_instance_id,
            'name': workflow_instance_name,
            'creation_time': Date.now() / 1000,
            'start_worker_id': start_worker_id,
            'start_meta_worker': start_meta_worker
        };

        if(!exists_workflow_instance_before)
            status.update_workflow_instance(
                connection, workflow, workflow_instance_id, workflow_instance_data
            );

        var to_send_data = {
            'inputs': initial_data,
            'workflow_instance': workflow_instance_data,
            'jobs_ids': [],
            'workers_output': {
                'initial': initial_data
            },
            'workers': []
        };

        if(!exists_workflow_instance_before)
            status.stats_add_new_instance(connection, workflow, to_send_data.workflow_instance);

        outputs.write_one_output(connection, start_meta_worker, start_worker_id, to_send_data);

        return workflow_instance_id;
};

for (var key in poliglo_start) {
  exports[key] = poliglo_start[key];
}
