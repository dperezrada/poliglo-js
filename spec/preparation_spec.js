var poliglo = require('..'),
    redis = require('redis'),
    request = require('request'),
    util = require('util');

var POLIGLO_SERVER_TEST_URL = 'something';
describe("Preparation", function() {
    var config;
    var lala;
    beforeEach(function() {
        config = {
            'REDIS_HOST': '1',
            'REDIS_PORT': '2',
            'REDIS_DB': '3',
        };
    });
    it("test_get_connections", function() {
        spyOn(redis, 'createClient').andReturn({
            'select': function(db){}
        });
        poliglo.preparation.get_connection(
            config
        );
        // Validation should be made in callback.
        expect(redis.createClient).toHaveBeenCalledWith('2', '1', {});
    });
    // TODO: pending
    // it("test_get_config", function() {});

    it("test_get_worker_workflow_data", function() {
        var workflow_instance_data = {'workflow_instance': {'workflow': 'workflow1'}};
        var worker_workflows = {
            'workflow1': {
                'filter_worker_1': {
                    'default_inputs':{
                        "name": "Juan"
                    }
                },
                'filter_worker_2':{
                    'default_inputs':{
                        "company": "Acme"
                    }
                }
            },
            'workflow2': {}
        };
        var expected = worker_workflows.workflow1.filter_worker_1;
        var result = poliglo.preparation.get_worker_workflow_data(
            worker_workflows, workflow_instance_data, "filter_worker_1"
        );
        expect(expected).toEqual(result);

        expected = worker_workflows.workflow1.filter_worker_2;
        result = poliglo.preparation.get_worker_workflow_data(
            worker_workflows, workflow_instance_data, "filter_worker_2"
        );
        expect(expected).toEqual(result);
    });

    // TODO: pass this test
    // it("test_get_worker_workflow_data", function(done) {
    //     meta_worker = 'meta_worker';
    //     mocked_urls = {};
    //     url = util.format(
    //         poliglo.variables.POLIGLO_SERVER_URL_WORKER_WORKFLOWS,
    //         POLIGLO_SERVER_TEST_URL, meta_worker
    //     );
    //     body = poliglo.utils.to_json({
    //         'workflow1': {'default_inputs': {'version': 'v1'}},
    //         'workflow2': {'default_inputs': {'version': 'other'}}
    //     });
    //     // TODO: mock
    //     // spyOn(request, 'get')
    //     // spyOn(poliglo.preparation, 'get_connection').andReturn('This is a connection');

    //     poliglo.preparation.prepare_worker(
    //         poliglo.variables.POLIGLO_SERVER_TEST_URL, meta_worker,
    //         function(prepared_worker){
    //             expect(body).toEqual(prepared_worker.worker_workflows);
    //             expect(prepared_worker.connection).toEqual('This is a connection');
    //             expect(true).toEqual(false);
    //             done();
    //         }
    //     );
    // });
});
