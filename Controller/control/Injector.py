# As Flask creates own instances of given classes, dependency injection is challenging.
# It could either be provided using kwargs or using this injector

from control.WorkerControl import WorkerControl
from data.StorageIO import StorageIO
from data.ArchitectureIO import ArchitecureIO

class Injector:
    workerControl: WorkerControl = None
    storageIO: StorageIO = None
    architectureIO: ArchitecureIO = None

    @staticmethod
    def inject(workerCont: WorkerControl, storage:StorageIO, architec: ArchitecureIO):
        Injector.workerControl = workerCont
        Injector.storageIO = storage
        Injector.architectureIO = architec
