var poliglo = require('..');

describe("Read Inputs", function() {
    var worker_workflow_data,
        workflow_instance_data;
    beforeEach(function() {
        worker_workflow_data = {
            "before": {
                "select_inputs": {
                    "email": "workers_output.get_emails_to_send.email",
                    "template_file": "workers_output.assign_variable.template_file"
                }
            },
            "next_workers": ["worker1"]
        };
        workflow_instance_data = {
            'workers_output': {
                'get_emails_to_send': {
                    'email': 'test@test.com'
                },
                'assign_variable': {
                    'template_file': '/tmp/testfile.handlebars'
                }
            }
        };
    });

    it("test_before_select_inputs", function() {
        var result = poliglo.inputs.get_inputs(
            workflow_instance_data,
            worker_workflow_data
        );
        expected = {
            'email': 'test@test.com',
            'template_file': '/tmp/testfile.handlebars'
        };
        expect(result).toEqual(expected);
    });

    it("test_before_select_inputs_not_overwrite_input", function() {
        workflow_instance_data.inputs = {'email': 'test_master@test.com'};
        result = poliglo.inputs.get_inputs(workflow_instance_data, worker_workflow_data);
        expected = {'email': 'test_master@test.com', 'template_file': '/tmp/testfile.handlebars'};
        expect(result).toEqual(expected);
    });
});

describe("Job Data", function() {
    it("test_get_job_data_str", function() {
        var raw_data = poliglo.utils.to_json({'inputs': {'name': 'Daniel Pérez'}})
        var job_data = poliglo.inputs.get_job_data(raw_data);
        var expected = 'Daniel Pérez';
        var result = poliglo.utils.select_dict_el(job_data, 'inputs.name');
        expect(result).toEqual(expected);
    });
});

