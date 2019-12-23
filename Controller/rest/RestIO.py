from flask import Flask
from flask_restful import Api
from flask_cors import CORS
import logging

from rest.Resources import Dataset, Job, View, Experiment, Architecture, Architecture_config, User



class RestIO:
    auth = None

    def __init__(self):
        app = Flask(__name__)
        CORS(app)
        api = Api(app)

        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)

        ressources = {
            Dataset: "datasets",
            View: "views",
            Experiment: "experiments",
            Job: "jobs",
            Architecture: "architectures",
            Architecture_config: "architecture_configs"
        }

        for resource, name in ressources.items():
            api.add_resource(resource, "/" + name, "/" + name + "/<id>", "/" + name + "/<id>/<content_type>", "/" + name + "/<id>/<content_type>/<extra>")

        api.add_resource(User, "/users")

        # Let's rumble
        app.run(debug=False, host="0.0.0.0", use_reloader=False)
