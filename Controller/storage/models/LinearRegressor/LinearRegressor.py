from tensorflow.python.keras.layers import Dense
from tensorflow.python.keras.models import Sequential, load_model
from tensorflow.python.keras.optimizers import Adam

from Algorithm import Algorithm
from KerasCallback import StatusCallback


class LinearRegressor(Algorithm):

    def __init__(self, data, labels, config, job_id, api):
        self.__data = data
        self.__labels = labels
        self.__config = config['parameters']
        self.__arch_config_id = config['architecture_config_id']
        self.__job_id = job_id
        self.__api = api

        n_features = data.shape[1]

        mean = self.__data.mean(axis=0)
        self.__data -= mean
        std = self.__data.std(axis=0)
        self.__data /= std

        # self.__model = Sequential()
        # self.__model.add(layer=Dense(units=1, input_dim=n_features, activation='linear'))

        self.__model = Sequential()
        self.__model.add(Dense(64, activation='relu', input_dim=n_features))
        self.__model.add(Dense(64, activation='relu'))
        self.__model.add(Dense(1))
        self.__model.compile(optimizer='rmsprop',
                             loss='mse',
                             metrics=['mae', 'acc'])


    def fit(self):
        self.__model.fit(x=self.__data,
                         y=self.__labels,
                         batch_size=self.__config['batch_size'],
                         epochs=self.__config['epochs'],
                         validation_split=self.__config['validation_split'],
                         shuffle=self.__config['shuffle'],
                         callbacks=[StatusCallback(api=self.__api, job_id=self.__job_id)])


    def evaluate(self, data, labels):
        self.__model.evaluate(x=data, y=labels)


    def predict(self, data):
        return self.__model.predict(x=data)


    def save(self, filepath):
        self.__model.save(filepath=filepath + '/model.h5')


    def load(self, filepath):
        self.__model = load_model(filepath=filepath)


    def check_data(self, data, labels):
        pass
