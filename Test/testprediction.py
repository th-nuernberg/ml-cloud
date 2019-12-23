import requests

from RestAPI import RestAPI


class Testp:

    def __init__(self, view_id, arch_conf_id):
        self.__host = 'http://localhost:5000/'
        self.__auth = requests.auth.HTTPBasicAuth(username='super', password='mario')
        self.__api = RestAPI(domain='http://localhost:5000', fallback_domain='http://127.0.0.1:5000')
        self.run_test(view_id=view_id, arch_conf_id=arch_conf_id)


    def run_test(self, view_id, arch_conf_id):
        job_conf = {
            "view_ids": [view_id],
            "type": "predict",
            "architecture_config_id": ""
        }

        experiment_conf = {
            "job_ids": []
        }

        job_conf['architecture_config_id'] = arch_conf_id
        job_id = self.__api.create_job(view_ids=view_id, architecture_config_id=arch_conf_id, job_conf=job_conf)[
            'job_id']
        experiment_conf['job_ids'] = [job_id]
        experiment_id = self.__api.create_experiment(experiment_conf=experiment_conf, job_id=job_id)['experiment_id']
        self.__api.start_experiment(experiment_id=experiment_id)


if __name__ == '__main__':
    test = Test()
