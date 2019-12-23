from keras.callbacks import Callback
from RestAPI import RestAPI


class StatusCallback(Callback):

    def __init__(self, api: RestAPI, job_id):
        super().__init__()
        self.job_id = job_id
        self.api = api


    def on_epoch_end(self, epoch, logs=None):
        self.api.update_job_progress(job_id=self.job_id, parameter='epoch', value=(epoch + 1)) # +1 as epochs starts with 0, but one epoch has already ended
        for k, v in logs.items():
            self.api.update_job_progress(job_id=self.job_id, parameter=k, value=float(v))


    def on_train_begin(self, logs=None):
        pass


    def on_train_end(self, logs=None):
        self.api.update_job_status(job_id=self.job_id, parameter='status', value='finished')