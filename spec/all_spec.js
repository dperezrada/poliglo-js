// describe("WriteOutputs", function() {
//     var workflow_instance_data,
//         worker_output_data,
//         worker_workflow_data,
//         connection,
//         worker_id;

//      beforeEach(function() {
//         workflow_instance_data = {
//             'workflow_instance': {
//                 'workflow': 'example_workflow_instance',
//                 'id': '123',
//                 'worker_id': 'worker_1'
//             },
//             'jobs_ids': ['5',]
//         };
//         worker_output_data = {'message': 'hello'};
//         worker_workflow_data = {
//             '__next_workers_types': ['write'],
//             'next_workers': ['worker_2']
//         };
//         connection = redis.createClient();

//         worker_id = 'worker_1';
//      });

//      // afterEach(function() {
//      //   foo = 0;
//      // });

//     it("test_set_workers_output", function() {
//         sinon.spy(poliglo, "add_data_to_next_worker");

//         poliglo.write_outputs(
//             connection, workflow_instance_data,
//             worker_output_data, worker_workflow_data
//         );

//         console.log(poliglo.add_data_to_next_worker.args);

//     });
// });

