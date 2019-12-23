from messageIO.MqttClient import MqttClient
import uuid
import json


class CommandIO:
    topics = {
        "test": "ai/toWorker/<id>/test",
        "presence": "ai/worker/<id>",
        "architecture": "ai/fromWorker/<id>/architectures",
        "progress_update": "ai/fromWorker/<id>/progress",
        "busy": "ai/fromWorker/<id>/busy",
        "config": "ai/toWorker/<id>/newJob",
        "abort": "ai/toWorker/<id>/abortJob"
    }

    def __generate_topics(self, unid):
        for key, topic in self.topics.items():
            if "<id>" in topic:
                self.topics[key] = topic.replace("<id>", unid)

    def __on_connect(self):
        print("Connected")
        self.update_busy_state(False)

    def __init__(self):
        id = "w_" + str(uuid.uuid4()).split("-")[0]
        self.__generate_topics(id)
        mqtt_client = MqttClient(id)
        mqtt_client.set_broker("127.0.0.1", 1883)
        mqtt_client.connect(self.__on_connect, self.topics["busy"], "")
        self.client = mqtt_client

    '''
        Test function for callbacks.
        Params:
            callback     Function to call upon message. Must have one string-arg
        '''

    def on_test(self, callback):
        self.client.subscribe(self.topics["test"], callback)

    def on_config(self, callback):
        self.client.subscribe(self.topics["config"], callback)

    def on_abort(self, callback):
        self.client.subscribe(self.topics["abort"], callback)

    def update_busy_state(self, is_busy:bool, status:str, job_id:str = None):
        message = {}
        message["busy"] = is_busy
        message["status"] = status
        if job_id is not None:
            message["job_id"] = job_id

        self.client.publish(self.topics["busy"], json.dumps(message), True)

    def update_progress(self, message):
        self.client.publish(self.topics["progress_update"], message, True)
