import requests
from RestAPI import RestAPI
import time
import sys
from testprediction import Testp

class Test:

    def __init__(self):
        self.__host = 'http://localhost:5000/'
        self.__auth = requests.auth.HTTPBasicAuth(username='super', password='mario')
        self.__api = RestAPI(domain='http://localhost:5000', fallback_domain='http://127.0.0.1:5000')


    def run_test(self):

        arch_conf = {
            "architecture_id": "LinearRegressor",
            "parameters": {
                "batch_size": 30,
                "learning_rate": 0.01,
                "epochs": 1,
                "validation_split": 0.2,
                "shuffle": False
            },
            "has_trained_model": False
        }

        view_conf = {
            "name": "name_der_view",
            "column_names": ["Last name", "First name", "SSN", "Test1", "Test2", "Test3", "Test4", "Final", "Grade"],
            "data_columns": [
                5, 6
            ],
            "target_columns": [
                7
            ],
            "dataset_id": ""
        }

        job_conf = {
            "view_ids": [],
            "type": "train",
            "architecture_config_id": ""
        }

        experiement_conf = {
            "job_ids": []
        }

        dataset = self.__api.create_dataset()
        dataset_id = dataset['dataset_id']
        self.__api.upload_dataset(fp='data.csv', dataset_id=dataset_id)
        view = self.__api.upload_view(view_conf=view_conf, dataset_id=dataset_id)
        view_id = view['view_id']
        architecture_config = self.__api.upload_architecture_config(architecture_conf=arch_conf)
        architecture_config_id = architecture_config['architecture_config_id']
        job_conf['view_ids'] = [view_id]
        job_conf['architecture_config_id'] = architecture_config_id
        job = self.__api.create_job(view_ids=view_id, architecture_config_id=architecture_config_id, job_conf=job_conf)
        job_id = job['job_id']
        experiement_conf['job_ids'] = [job_id]
        experiment = self.__api.create_experiment(experiment_conf=experiement_conf, job_id=job_id)
        experiment_id = experiment['experiment_id']
        self.__api.start_experiment(experiment_id=experiment_id)

        # print("Sleeping 10 seconds")
        # time.sleep(10)

        # job_config = self.__api.get_job(job_id)
        # status = job_config["status"]
        test = Testp(view_id=view_id, arch_conf_id=architecture_config_id)

        # print("Job status: " + status)
        # if status == "finished":
        #     sys.exit(0)
        # else:
        #     sys.exit(1)


if __name__ == '__main__':
    test = Test()
    test.run_test()
