import paho.mqtt.client as mqtt
import time
import traceback

class MqttClient:

    def __init__(self, unid):
        self.broker = None
        self.port = 1883
        self.subscription_list = {}
        self.callback = None
        self.client = mqtt.Client(unid)
        self.external_on_connect = None


    # The callback for when the client receives a CONNACK response from the server.
    def on_connect(self, client, userdata, flags, rc):
        for topic, callback in self.subscription_list.items():
            client.subscribe(topic)
        if self.external_on_connect is not None:
            self.external_on_connect()

    # The callback for when a PUBLISH message is received from the server.
    def on_message(self, client, userdata, msg):
        try:
            for topic, callback in self.subscription_list.items():
                if (mqtt.topic_matches_sub(topic, msg.topic)):
                    callback(msg.topic, msg.payload.decode('utf-8'))
        except Exception as e:
            print(e)
            traceback.print_exc()


    def set_broker(self, broker,port):
        self.broker = broker
        self.port = port

    def subscribe(self, topic, callback):
        self.subscription_list[topic] = callback
        self.client.subscribe(topic)

    def set_callback(self, callback):
        self.callback = callback

    def publish(self, topic, message, retained):
        self.client.publish(topic, message, retain=retained)

    def connect(self, external_connect_callback, last_will_topic, last_will):
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.last_will_topic = last_will_topic
        self.last_will = last_will
        self.external_on_connect = external_connect_callback
        self.client.will_set(last_will_topic,last_will, 0, True)
        while (True):
            try:
                retval = self.client.connect(self.broker, self.port, 60)
                break
            except:
                print(".")
                if self.broker == "127.0.0.1":
                    print("Can't reach localhost. Trying docker network instead (broker:1883)")
                    self.broker = "broker"
                else:
                    self.broker = "127.0.0.1"
                time.sleep(1)
                pass
        self.client.loop_start()
        if retval != 0:
            print("Error connecting to MQTT-Broker")
        return retval
