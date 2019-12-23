import json
import shutil
import time
import requests


class RestAPI:

    def __init__(self, domain: str, fallback_domain: str):
        self.domain = domain
        self.fallback_domain = fallback_domain
        self.auth = requests.auth.HTTPBasicAuth(username='mario', password='super')
        self.check_domain()


    def get(self, url):
        url = self.domain + url
        r = requests.get(url=url, auth=self.auth)
        return r


    def post(self, url=None, json=None, data=None):
        url = self.domain + url
        if data:
            r = requests.post(url=url, data=data, auth=self.auth).json()
            return r
        elif json:
            r = requests.post(url=url, json=json, auth=self.auth).json()
            return r
        else:
            r = requests.post(url=url, auth=self.auth).json()
            return r


    def put(self, url, files=None):
        url = self.domain + url
        if files:
            r = requests.put(url=url, files=files, auth=self.auth)
            return r
        else:
            r = requests.put(url=url, auth=self.auth)
            return r


    def patch(self, url, json=None):
        url = self.domain + url
        r = requests.patch(url=url, json=json, auth=self.auth)

        return r


    def check_domain(self):
        while (True):
            try:
                self.get('/architectures').json()
                print("Hostname successfully checked")
                break
            except:
                print("Switching hostname to fallback: " + self.fallback_domain)
                temp = self.fallback_domain
                self.fallback_domain = self.domain
                self.domain = temp
                print("Worker failed to connect to controller! Trying " + self.domain)
                time.sleep(1)


    def get_job_config(self, job_id: str):
        url = '/jobs/' + job_id
        r = self.get(url=url).json()
        return r


    def get_view(self, view_id: str):
        url = '/views/' + view_id
        r = self.get(url=url).json()
        return r


    def get_dataset(self, dataset_id: str):
        url = '/datasets/' + dataset_id + '/bin/data'
        r = self.get(url=url).content
        return r


    def get_architecture_config(self, architecture_config_id: str):
        url = '/architecture_configs/' + architecture_config_id
        r = self.get(url=url).json()
        return r


    def get_architecture(self, architecture_id: str):
        url = '/architectures/' + architecture_id + '/bin/data'
        r = self.get(url=url).content
        return r


    def get_architecture_config_file(self, arch):
        url = '/architectures/' + arch
        r = self.get(url=url).json()
        return r


    def create_dataset(self):
        url = '/datasets'
        r = self.post(url=url)
        return r


    def upload_dataset(self, fp: str, dataset_id: str):
        url = '/datasets/' + dataset_id + '/bin/data'
        file = {'file': open(fp, 'rb')}
        r = self.put(url=url, files=file)

        return r


    def upload_view(self, view_conf: dict, dataset_id: str):
        url = '/views'
        view_conf['dataset_id'] = dataset_id
        r = self.post(url=url, json=view_conf)

        return r


    def upload_architecture_config(self, architecture_conf):
        url = '/architecture_configs'
        r = self.post(url=url, json=architecture_conf)

        return r


    def upload_model(self, architecture_id: str, filepath: str):
        url = '/architecture_configs/' + architecture_id + '/bin/data'
        file = {'file': open(filepath, 'rb')}
        r = self.put(url=url, files=file)


    def download_model(self, architecture_config_id: str, filepath: str):
        url = '/architecture_configs/' + architecture_config_id + '/bin/data'
        r = self.get(url=url)
        with open(filepath, 'wb') as f:
            f.write(r.content)
            return f.name


    def upload_zip(self, job_id: str, filepath: str):
        url = '/jobs/' + job_id + '/bin/data'
        file = {'file': open(filepath, 'rb')}
        r = self.put(url=url, files=file)


    def upload_log(self, job_id: str, filepath: str):
        url = '/jobs/' + job_id + '/bin/log'
        file = {'file': open(filepath, 'r')}
        r = self.put(url=url, files=file)


    def download_zip(self, job_id: str, filepath: str):
        url = self.domain + '/jobs/' + job_id + '/bin/data'
        with open(filepath, 'wb') as f:
            shutil.copyfileobj(requests.get(url=url, stream=True).raw, f)
            return f.name


    def create_job(self, job_conf, view_ids, architecture_config_id):
        url = '/jobs'
        job_conf['view_ids'] = [view_ids]
        job_conf['architecture_config_id'] = architecture_config_id
        r = self.post(url=url, json=job_conf)

        return r


    def upload_prediction(self, job_id, data):
        url = '/jobs/' + job_id + '/bin/generatedData'
        file = {'file': open(data, 'rb')}
        r = self.put(url=url, files=file)


    def create_experiment(self, experiment_conf, job_id):
        url = '/experiments'
        experiment_conf['job_ids'] = [job_id]
        r = self.post(url=url, json=experiment_conf)

        return r


    def start_experiment(self, experiment_id):
        url = '/experiments/' + experiment_id + '/exec/start'
        r = self.put(url=url)

        return r


    def initalize_progress(self, job_id):
        url = '/jobs/' + job_id
        progress = {"train_acc": "none"}
        data = [{'op': 'add', 'path': '/progress', 'value': progress}]
        r = self.patch(url=url, json=data)

        return r


    def update_job_progress(self, job_id, parameter, value):
        url = '/jobs/' + job_id
        data = [{'op': 'add', 'path': '/progress/' + parameter, 'value': value}]
        r = self.patch(url=url, json=data)

        return r


    def update_job_status(self, job_id, parameter, value):
        url = '/jobs/' + job_id
        data = [{'op': 'add', 'path': '/' + parameter, 'value': value}]
        r = self.patch(url=url, json=data)

        return r


    def update_has_trained_model(self, job_id):
        url = '/architecture_configs/' + job_id
        data = [{'op': 'replace', 'path': '/has_trained_model', 'value': True}]
        r = self.patch(url=url, json=data)

        return r


if __name__ == '__main__':
    api = RestAPI(domain='http://127.0.0.1:5000', fallback_domain='http://controller:5000')
    job_config = api.get_job_config(job_id='5d481a1eaf438bc0598586c5')
    view_config = api.get_view(view_id=job_config['view_ids'][-1])
    dataset = api.get_dataset(view_config['dataset_id'])
    architecutre = api.get_architecture(architecture_id=job_config['architecture_id'])
