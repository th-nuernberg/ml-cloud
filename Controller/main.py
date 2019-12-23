#!/usr/bin/env python3
# Required packages
# - paho-mqtt
# - flask
# - flask-Restful
# - flask-Cors
# - requests
# - pymongo
# - jsonpatch
# - flask-HTTPAuth

VERSION = "1.10"

import time
from threading import Thread

from mqtt.CommandIO import CommandIO
from rest.RestIO import RestIO
from control.Injector import Injector
from control.WorkerControl import WorkerControl
from data.StorageIO import StorageIO
from data.ArchitectureIO import ArchitecureIO


print("Starting... (v" + VERSION + ")")

# Storage
storage = StorageIO()
architectureIO = ArchitecureIO()

# Worker
workerControl = WorkerControl(CommandIO(), storage)
t = Thread(target=workerControl.run)
t.start()

Injector.inject(workerControl, storage, architectureIO)
restIO = RestIO()

# Never reached
print("Bye")

