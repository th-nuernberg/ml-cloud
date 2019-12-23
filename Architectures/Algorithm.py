from abc import ABC, abstractmethod

class Algorithm(ABC):
    '''Base class for all machine learning algorithms.

    This class provides a easy way to use different ML algorithms transparently.

    '''

    @abstractmethod
    def fit(self):
        '''Should implement the algorithms training procedure.'''
        pass

    @abstractmethod
    def evaluate(self):
        '''Should implement the algorithms evaluation procedure'''
        pass

    @abstractmethod
    def predict(self):
        '''Should implement the algorithms prediction procedure'''
        pass

    @abstractmethod
    def save(self):
        '''Should implement the functionality to save a trained algorithm'''

    @abstractmethod
    def load(self):
        '''Should implement the functionality to load a saved algorithm'''