import numpy as np
from tensorflow.python.keras.layers import Dense
from tensorflow.python.keras.models import Sequential, load_model
from tensorflow.python.keras.optimizers import RMSprop

from Algorithm import Algorithm
from KerasCallback import StatusCallback


class BinaryClassifier(Algorithm):

    def __init__(self, data, labels, config, job_id, api):
        self.__data = data
        self.__labels = labels
        self.__config = config['parameters']
        self.__arch_config_id = config['architecture_config_id']
        self.__job_id = job_id
        self.__api = api

        n_features = data.shape[1]
        n_hidden_units = (n_features + len(labels)) // 2

        self.__model = Sequential()
        self.__model.add(layer=Dense(units=n_features, activation='relu'))
        self.__model.add(layer=Dense(units=n_hidden_units, activation='relu'))
        self.__model.add(layer=Dense(units=len(labels), activation='sigmoid'))
        self.__model.compile(loss='binary_crossentropy', optimizer=RMSprop(), metrics=['acc'])


    def fit(self):
        if self.check_data(self.__data, self.__labels):
            self.__model.fit(x=self.__data,
                             y=self.__labels,
                             batch_size=self.__config['batch_size'],
                             epochs=self.__config['epochs'],
                             validation_split=self.__config['validation_split'],
                             shuffle=self.__config['shuffle'],
                             callbacks=[StatusCallback(api=self.__api, job_id=self.__job_id)])
        else:
            return


    def evaluate(self, data, labels):
        self.__model.evaluate(x=data, y=labels)


    def predict(self, data):
        return self.__model.predict(x=data)


    def save(self, filepath):
        self.__model.save(filepath=filepath + '/model.h5')


    def load(self, filepath):
        self.__model = load_model(filepath=filepath)


    def check_data(self, data, labels):
        if not False in np.isin(labels, (0, 1)):
            return True
        else:
            self.__api.update_job_status(job_id=self.__job_id, parameter='status',
                                         value='failed: one or more values of labels are out of range of compatible values')
            return False
