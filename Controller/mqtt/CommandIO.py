from mqtt.MqttClient import MqttClient
import uuid


class CommandIO:
    topics = {
        "test": "ai/toController/<id>/test",
        "presence": "ai/controller/<id>",
        "progress_update": "ai/fromWorker/+/progress",
        "busy": "ai/fromWorker/+/busy",
        "config": "ai/toWorker/<workerId>/newJob",
    }

    def __generate_topics(self, unid):
        for key, topic in self.topics.items():
            if "<id>" in topic:
                self.topics[key] = topic.replace("<id>", unid)

    def __on_connect(self):
        print("Connection to MQTT established")

    def __init__(self):
        print("Connecting to MQTT...")
        self.instantiated = True
        id = "controller_" + str(uuid.uuid4()).split("-")[0]
        self.__generate_topics(id)
        mqtt_client = MqttClient(id)
        mqtt_client.set_broker("127.0.0.1", 1883)
        mqtt_client.connect(self.__on_connect, self.topics["presence"], "")
        self.client = mqtt_client

    def start_new_job(self, worker_id, config):
        worker_topic = self.topics["config"].replace("<workerId>", worker_id)
        self.client.publish(worker_topic, config, False)
        print("New worker started (" + worker_id + ")")

    def busy_proxy(self, topic, message):
        worker_id = topic.split("/")[2]
        self.busy_callback(worker_id, message)

    def on_busy_changed(self, callback):
        self.busy_callback = callback
        self.client.subscribe(self.topics["busy"], self.busy_proxy)

    def status_proxy(self, topic, message):
        worker_id = topic.split("/")[2]
        self.status_callback(worker_id, message)

    def on_status_received(self, callback):
        self.status_callback = callback
        self.client.subscribe(self.topics["progress_update"], self.status_proxy)
