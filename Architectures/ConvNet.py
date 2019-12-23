from keras.models import Sequential
from keras.models import load_model
from keras.layers import Dense, Conv2D, Flatten
from Architectures.Algorithm import Algorithm


# noinspection PyMethodOverriding
class ConvNet(Algorithm):

    def __init__(self, hidden_layer:list, n_classes:int, input_shape:tuple):
        self.__model = Sequential()
        self.__model.add(Conv2D(filters=hidden_layer[0], kernel_size=3, activation='relu', input_shape=input_shape))
        [self.__model.add(layer=Conv2D(filters=n_filters, kernel_size=3, activation='relu')) for n_filters in hidden_layer[1:]]
        self.__model.add(layer=Flatten())
        self.__model.add(layer=Dense(units=n_classes, activation='softmax'))
        self.__model.compile(optimizer='adam', loss='categorical_crossentropy')
        self.__model.summary()

    def fit(self, x, y, batch_size, epochs, val_split):
        """Fit the neural network an data x and labels y.

        :param x: a numpy.ndarray of shape (n_examples, n_features, n_channels)
        :param y: a numpy.ndarray of shape (n_examples, n_classes)
        :param batch_size: a int specifying the number of examples per batch
        :param epochs: a int specifying the number of epochs to train the neural network
        :param val_split: a float < 1 specifying the fraction of training data to be used as validation data
        """

        self.__model.fit(x=x, y=y, batch_size=batch_size, epochs=epochs, validation_split=val_split)

    def evaluate(self, x, y):
        """Evaluate a neural network on given data x and labels y

        :param x: a numpy.ndarray of shape (n_examples, n_features, n_channels)
        :param y: a numpy.ndarray of shape (n_examples, n_classes)
        """
        self.__model.evaluate(x=x, y=y)

    def predict(self, x):
        """Generate predictions for the samples x

        :param x: a numpy.ndarray of shape (n_examples, n_features, n_channels)
        """
        self.__model.predict(x=x)

    def save(self, file):
        """Saves the model and the weights to file

        :param file: A file-like object to save the model and weights to
        """
        self.__model.save(filepath=file)

    def load(self, file):
        """Load the model and weights.

        :param file: A file-like object to load the model and weights from
        """

        self.__model = load_model(filepath=file)

if __name__ == '__main__':
    network = ConvNet([64, 128, 256], 10, (28, 28, 1))