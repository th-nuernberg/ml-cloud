from Architectures.Algorithm import Algorithm
from keras.models import Sequential
from keras.layers import Dense


# noinspection PyMethodOverriding
class MulticlassClassifier(Algorithm):

    def __init__(self, data, labels, config):
        self.__data = data
        self.__labels = labels
        self.__config = config

        n_features = data.shape[1]
        n_hidden_units = (n_features + len(labels)) // 2

        self.__model = Sequential()
        self.__model.add(layer=Dense(units=n_features, activation='relu'))
        self.__model.add(layer=Dense(units=n_hidden_units, activation='relu'))
        self.__model.add(layer=Dense(units=len(labels), activation='softmax'))
        self.__model.compile(loss='categorical_crossentropy', optimizer='rmsprob', metrics='accuracy')

    def fit(self):
        self.__model.fit(x=self.__data,
                         y=self.__labels,
                         batch_size=self.__config['batch_size'],
                         epochs=self.__config['epochs'],
                         validation_split=self.__config['validation_split'],
                         shuffle=self.__config['shuffle'])

    def evaluate(self, data, labels):
        self.__model.evaluate(x=data, y=labels)

    def predict(self, data):
        self.__model.predict(x=data)

    def save(self):
        pass

    def load(self):
        pass
