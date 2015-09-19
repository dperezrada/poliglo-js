
exports.REDIS_KEY_QUEUE = 'queue:%s';
exports.REDIS_KEY_QUEUE_FINALIZED = 'queue:finalized';
exports.REDIS_KEY_INSTANCES = 'workflows:%s:workflow_instances';
exports.REDIS_KEY_ONE_INSTANCE = "workflows:%s:workflow_instances:%s";
exports.REDIS_KEY_INSTANCE_WORKER_TIMING = "workflows:%s:workflow_instances:%s:workers:%s:timing";
exports.REDIS_KEY_INSTANCE_WORKER_FINALIZED_JOBS = "workflows:%s:workflow_instances:%s:workers:%s:finalized";
exports.REDIS_KEY_INSTANCE_WORKER_JOBS = "workflows:%s:workflow_instances:%s:workers:%s:jobs_ids:%s";
exports.REDIS_KEY_INSTANCE_WORKER_ERRORS = "workflows:%s:workflow_instances:%s:workers:%s:errors";
exports.REDIS_KEY_INSTANCE_WORKER_DISCARDED = "workflows:%s:workflow_instances:%s:workers:%s:discarded";
exports.POLIGLO_SERVER_URL_WORKER_CONFIG = "%s/meta_workers/%s/config";
exports.POLIGLO_SERVER_URL_WORKER_WORKFLOWS = "%s/meta_workers/%s/workflows";
