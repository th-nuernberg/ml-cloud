from abc import ABC, abstractmethod


class Algorithm(ABC):
    """Base class for all machine learning algorithms.

    This class provides a easy way to use different ML algorithms transparently.

    """


    @abstractmethod
    def fit(self):
        """Should implement the algorithms training procedure."""
        pass


    @abstractmethod
    def evaluate(self, data, labels):
        """Should implement the algorithms evaluation procedure"""
        pass


    @abstractmethod
    def predict(self, data):
        """Should implement the algorithms prediction procedure"""
        pass


    @abstractmethod
    def save(self, filepath):
        """Should implement the functionality to save a trained algorithm"""


    @abstractmethod
    def load(self, filepath):
        """Should implement the functionality to load a saved algorithm"""


    @abstractmethod
    def check_data(self, data, labels):
        """Should impolement functionality to check compatibility of data for the specific architecutre"""
