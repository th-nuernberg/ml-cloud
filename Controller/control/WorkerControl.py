import json
import queue
from control.WorkerQueue import WorkerQueue as WQ
from data.StorageIO import StorageIO

'''
The WorkerControl coordinates workers and assigns jobs.
Worker register themself at startup. The controller queues workers as well as jobs in two seperate queues.
As soon as a worker and a job are available, they are taken from the queues and the job_id is send to the worker
via MQTT. After the worker finishes its job, it will be put back into the queue
'''
class WorkerControl:
    config_queue = queue.Queue(-1) # infinite size

    COMMAND_START = "start"
    COMMAND_STOP = "stop"

    commandIO = None
    storageIO: StorageIO = None
    worker_list = {}  # "worker_id" : "job_id"

    worker_job_mapping = {}

    worker_queue = WQ()

    def get_worker_info(self):
        return self.worker_list

    # Function called by external Thread !!!
    def busy_changed_callback(self, worker_id, busy_message):
        try:
            if len(busy_message) == 0:
                print("Worker LOST: " + worker_id)
                self.worker_queue.remove_worker(worker_id)
                self.worker_list.pop(worker_id, None)
                if not worker_id in self.worker_job_mapping:
                    print("Unknown worker reported busy change! This should not happen")
                else:
                    self.update_status(worker_id, "lost")
            else:
                message = json.loads(busy_message)
                is_busy = message["busy"]  # either False or the job_id

                self.worker_list[worker_id] = is_busy
                if is_busy == False:
                    if "job_id" in message:
                        self.update_status(worker_id, message["status"])

                    if worker_id in self.worker_job_mapping:
                        del self.worker_job_mapping[worker_id]
                    self.worker_queue.add_to_queue(worker_id)
                else:
                    job_id = message["job_id"]
                    self.worker_queue.remove_worker(worker_id)
                    self.worker_job_mapping[worker_id] = job_id
                    self.update_status(worker_id, message["status"])
                    print("Worker is busy: " + worker_id)
        except Exception as e:
            print("An error occurred in MQTT callback: " + str(e))


    def update_status(self, worker_id: str, status: str):
        if not worker_id in self.worker_job_mapping:
            print("ERROR. Tried to set status for unset worker!")
        else:
            self.storageIO.update_job_status(self.worker_job_mapping[worker_id], status)

    def __init__(self, commandIO, storageIO: StorageIO):
        self.commandIO = commandIO
        self.storageIO = storageIO
        self.commandIO.on_busy_changed(self.busy_changed_callback)

    def modify_job_state(self, job_list, command: str):
        for job in job_list:
            config = {"job_id": job}

            if command == self.COMMAND_START:
                self.create_new_job(config)
            else:
                pass

    # Function called by external Thread !!!
    def create_new_job(self, job_config: dict):
        try:
            print("-> Job ready (ID=" + job_config["job_id"] + ")")
            self.config_queue.put(job_config, timeout=1)
        except:
            return False
        return True

    def run(self):
        while (True):
            jsonConfig = self.config_queue.get()
            job_id = jsonConfig["job_id"]
            print("<- Job selected (ID=" + job_id + ")")
            ready_worker = self.worker_queue.get_next_worker()

            print("Starting new job (id: " + job_id + ")")
            self.commandIO.start_new_job(ready_worker, json.dumps(jsonConfig))
            if ready_worker in self.worker_job_mapping:
                print("Removing orphaned job from worker job mapping")
                del self.worker_job_mapping[ready_worker]
            self.worker_job_mapping[ready_worker] = job_id
            self.update_status(ready_worker, "assigned")

