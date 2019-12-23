import importlib
import json
import logging
import queue
import os
import shutil
from zipfile import ZipFile

import numpy as np
import tensorflow as tf
from RestAPI import RestAPI
from messageIO.CommandIO import CommandIO


class Worker:

    def __init__(self):
        logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%d. %b %y %H:%M:%S', filename='worker.log',
                            filemode='w', level=logging.DEBUG)
        self.__api = RestAPI(domain='http://controller:5000', fallback_domain='http://127.0.0.1:5000')
        self.__commandIO = CommandIO()
        self.__commandIO.on_config(callback=self.__config_received_callback)
        self.__commandIO.on_abort(callback=self.__abort_callback)
        self.__commandIO.update_busy_state(is_busy=False, status='idle')

        self.__job_queue = queue.Queue()
        logging.info('Worker fully initialized')
        self.__wait_for_jobs()


    def __config_received_callback(self, config):
        self.__job_queue.put(config)


    def __wait_for_jobs(self):
        job_id = None
        while True:
            print('waiting for a job')
            logging.info('Waiting for a job')
            try:
                job_config = self.__job_queue.get()  # Waits until a config is received

                shutil.rmtree('./temp', True)  # If the container is restarted this folder still exists
                os.makedirs('./temp')

                job_config = json.loads(job_config)
                logging.info('Got a job: ' + str(job_config))
                job_id = job_config["job_id"]

                self.__commandIO.update_busy_state(is_busy=True, status="running", job_id=job_id)

                self.__start_work(job_id)

                logging.info('Finished job ' + job_id)
                status = "finished"
                print("Worker finished")
            except Exception as e:
                self.__commandIO.update_progress("exception")
                self.__api.update_job_status(job_id=job_id, parameter='status', value='failed')
                logging.error('Got an exception', exc_info=True)
                status = "failed"
                print("Worker failed")
                with open('worker.log', 'r') as fin:
                    print(fin.read())

            self.__commandIO.update_busy_state(is_busy=False, status=status, job_id=job_id)


    def __start_work(self, job_id: str):
        logging.info('Start work')
        job = self.__api.get_job_config(job_id=job_id)

        view_ids = job['view_ids']
        architecture_config_id = job['architecture_config_id']
        architecture_config = self.__api.get_architecture_config(architecture_config_id=architecture_config_id)
        architecture_id = architecture_config['architecture_id']
        if job['type'] == 'train':
            self.__api.initalize_progress(job_id=job_id)
            self.__api.update_job_progress(job_id=job_id, parameter='max_epoch',
                                           value=architecture_config['parameters']['epochs'])

            model = self.__get_model(architecture_id=architecture_id)
            data, labels = self.__get_data_and_labels(view_id=view_ids[0])
            model = model(data=data, labels=labels, config=architecture_config, job_id=job_id, api=self.__api)
            model.fit()
            model.save('./temp')
            self.__api.upload_model(architecture_id=architecture_config_id, filepath='./temp/model.h5')
            self.__api.upload_log(job_id=job_id, filepath='worker.log')
            zippath = self.zip_dir(dirpath='./temp')
            self.__api.upload_zip(job_id=job_id, filepath=zippath)
            self.__api.update_has_trained_model(job_id=architecture_config_id)
        elif job['type'] == 'predict':
            model_path = self.__api.download_model(architecture_config_id=architecture_config_id,
                                                   filepath='./temp/model.h5')
            model = tf.keras.models.load_model(filepath=model_path)
            data = self.__get_data(view_id=view_ids[0])
            prediction = model.predict(data)
            architecture_config_file = self.__api.get_architecture_config_file(arch=architecture_config['architecture_id'])
            if architecture_config_file['output_type'] == 'scalar':
                prediction = prediction.reshape((-1, 1))
            elif architecture_config_file['output_type'] == 'vector':
                prediction = np.argmax(prediction, 1).reshape((-1, 1))
                pass

            data = np.concatenate([data, prediction], axis=1)
            np.savetxt("./temp/predictions.csv", data, delimiter=",", fmt='%s')
            self.__api.upload_prediction(job_id=job_id, data='./temp/predictions.csv')
        shutil.rmtree('./temp')


    def __get_model(self, architecture_id: str):
        architecture_string = self.__api.get_architecture(architecture_id=architecture_id).decode()
        with open(architecture_id + '.py', 'w') as f:
            f.write(architecture_string)
        module = importlib.import_module(name=architecture_id)
        model = getattr(module, architecture_id)

        return model


    def __get_data_and_labels(self, view_id: str):
        view = self.__api.get_view(view_id=view_id)
        dataset_id = view['dataset_id']
        dataset_string = self.__api.get_dataset(dataset_id=dataset_id).decode()
        data_columns = view['data_columns']
        target_columns = view['target_columns']
        logging.debug("Data columns: " + str(data_columns))
        logging.debug("Target (Label) columns: " + str(target_columns))

        with open(dataset_id + '.csv', 'w') as f:
            f.write(dataset_string)
        try:
            data = np.loadtxt(fname=dataset_id + '.csv', delimiter=',', skiprows=1, usecols=data_columns)
            labels = np.loadtxt(fname=dataset_id + '.csv', delimiter=',', skiprows=1, usecols=target_columns)
        except IndexError:
            data = np.loadtxt(fname=dataset_id + '.csv', delimiter=';', skiprows=1, usecols=data_columns)
            labels = np.loadtxt(fname=dataset_id + '.csv', delimiter=';', skiprows=1, usecols=target_columns)

        return data, labels


    def __get_data(self, view_id: str):
        view = self.__api.get_view(view_id=view_id)
        dataset_id = view['dataset_id']
        dataset_string = self.__api.get_dataset(dataset_id=dataset_id).decode()
        data_columns = view['data_columns']
        target_columns = view['target_columns']
        with open(dataset_id + '.csv', 'w') as f:
            f.write(dataset_string)
        try:
            data = np.loadtxt(fname=dataset_id + '.csv', delimiter=',', skiprows=1, usecols=data_columns)
        except IndexError:
            data = np.loadtxt(fname=dataset_id + '.csv', delimiter=';', skiprows=1, usecols=data_columns)

        return data


    @staticmethod
    def zip_dir(dirpath: str):
        with ZipFile(file='files.zip', mode='w') as zipfile:
            for root, dirs, files in os.walk(dirpath):
                for f in files:
                    zipfile.write(os.path.join(root, f))
        return zipfile.filename


    def __abort_callback(self):
        pass


if __name__ == '__main__':
    worker = Worker()
