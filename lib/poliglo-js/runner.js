var preparation = require('./preparation'),
    fs = require('fs'),
    inputs = require('./inputs'),
    status = require('./status'),
    variables = require('./variables'),
    outputs = require('./outputs'),
    util = require('util'),
    _ = require('lodash'),
    async = require('async');


var poliglo_runner = {};

poliglo_runner.default_main = function(
    master_mind_url, meta_worker, workflow_instance_func, options
){
    preparation.prepare_worker(master_mind_url, meta_worker, function(err, prepared_worker){
        // Manage failing case of prepared_worker
        if(process.env.TRY_INPUT){
            fs.readFile('/etc/hosts', 'utf8', function (err, raw_data) {
                if (err) {
                    return console.error(err);
                }
                var workflow_instance_data = inputs.get_job_data(raw_data);
                var worker_workflow_data = preparation.get_worker_workflow_data(
                    prepared_worker.worker_workflows,
                    workflow_instance_data,
                    workflow_instance_data.workflow_instance.worker_id
                );
                console.log(
                    workflow_instance_func(
                        worker_workflow_data, workflow_instance_data, options
                    )
                );
                return null;
            });
        }else{
            console.log(' [*] Waiting for data. To exit press CTRL+C');
            // TODO: add queue and callback
            // while(true){
                async.whilst(
                    function () { return true; },
                    function(callback){
                        poliglo_runner.default_main_inside_wrapper(
                            prepared_worker.connection, prepared_worker.worker_workflows,
                            meta_worker, workflow_instance_func, options, callback
                        );
                    },
                    function (err) {}
                );
            // }
        }
    });
};

poliglo_runner.default_main_inside_wrapper = function(
    connection, worker_workflows, meta_worker, workflow_instance_func, options, callback
){
    var queue_name = util.format(variables.REDIS_KEY_QUEUE, meta_worker);
    // ADD async for queue and manage the number of workers
    connection.brpop(
        queue_name,
        0,
        function(err, queue_message){
            poliglo_runner.default_main_inside(
                connection, worker_workflows, queue_message,
                workflow_instance_func, options, callback
            );
        }
    );
};

poliglo_runner.default_main_inside = function(
    connection, worker_workflows, queue_message, workflow_instance_func, options, callback
){
    var process_message_start_time = Date.now() / 1000;
    if(queue_message){
        var raw_data = queue_message[1];
        // try{
        var workflow_instance_data = inputs.get_job_data(raw_data);
        status.get_workflow_instance_key(
            connection,
            workflow_instance_data.workflow_instance.workflow,
            workflow_instance_data.workflow_instance.id,
            'start_time',
            function(err, start_time){
                if(!start_time){
                    status.update_workflow_instance_key(
                        connection,
                        workflow_instance_data.workflow_instance.workflow,
                        workflow_instance_data.workflow_instance.id,
                        'start_time',
                        process_message_start_time
                    );
                    start_time = process_message_start_time;
                }
                var last_job_id = _.last(workflow_instance_data.jobs_ids);
                var worker_id = workflow_instance_data.workflow_instance.worker_id;
                var worker_workflow_data = preparation.get_worker_workflow_data(
                    worker_workflows, workflow_instance_data,
                    workflow_instance_data.workflow_instance.worker_id
                );
                workflow_instance_func(
                    worker_workflow_data,
                    workflow_instance_data,
                    function(err_func, worker_outputs){
                        async.map(
                            worker_outputs,
                            function(worker_output_data, async_callback){
                                if(!worker_output_data)
                                    worker_output_data = {};
                                if(worker_output_data.__next_workers)
                                    worker_workflow_data.next_workers = worker_output_data.__next_workers || [];
                                if(worker_workflow_data.next_workers.length === 0){
                                    outputs.write_finalized_job(
                                        connection, workflow_instance_data, worker_output_data,
                                        worker_id, function(){
                                            async_callback(null, worker_output_data);
                                        }
                                    );
                                }
                                else{
                                    outputs.write_outputs(
                                        connection, workflow_instance_data,
                                        worker_output_data, worker_workflow_data,
                                        function(){
                                            async_callback(null, worker_output_data);
                                        }

                                    );
                                }
                            },
                            function(err, results){
                                console.log(results);
                                status.update_done_jobs(
                                    connection, workflow_instance_data.workflow_instance.workflow,
                                    workflow_instance_data.workflow_instance.id, worker_id,
                                    last_job_id, process_message_start_time, function(){
                                        if(worker_outputs.length === 0){
                                            var worker_output_data = {};
                                            outputs.write_finalized_job(
                                                connection, workflow_instance_data,
                                                worker_output_data, worker_id, callback
                                            );
                                        }else{
                                            callback();
                                        }
                                    }
                                );
                            }
                        );
                    },
                    options
                );
            }
        );
        // }catch(err){
        //     var worker_id = 'unknown';
        //     try{
        //         worker_id = workflow_instance_data.workflow_instance.worker_id;
        //     }catch(err2){}
        //     outputs.write_error_job(connection, worker_id, raw_data, err);
        //     //TODO: Manage if worker fails and message is lost
        // }
    }
};

for (var key in poliglo_runner) {
  exports[key] = poliglo_runner[key];
}
