import os
import sys
import json


class ArchitecureIO:
    ROOT_DIR = os.path.abspath(os.path.dirname(sys.modules['__main__'].__file__))
    STORAGE_PATH = os.path.join(ROOT_DIR, "storage")
    PATH_GENERAL_ARCHITECTURES = os.path.join(STORAGE_PATH, "models")

    KEY_ARCHITECTURE_ID: str = "internal_name"

    _architectures: dict = {}

    def __init__(self):
        print(" -  ROOT: " + self.ROOT_DIR)
        print(" -  STORAGE_PATH: " + self.STORAGE_PATH)
        print(" -  PATH_GENERAL_ARCHITECTURES: " + self.PATH_GENERAL_ARCHITECTURES)

        self._load_all_architectures(self.PATH_GENERAL_ARCHITECTURES)

    def _load_all_architectures(self, storage_path: str):
        for root, dirs, files in os.walk(storage_path):
            for dir in dirs:
                folderpath = os.path.join(root, dir)
                config_path = os.path.join(folderpath, "config.json")

                with open(config_path) as json_file:
                    data = json.load(json_file)
                    internal_name = data[self.KEY_ARCHITECTURE_ID]
                    self._architectures[internal_name] = data

    def get_architecture_list(self):
        return list(self._architectures.keys())

    def get_architecture(self, name: str):
        if name in self._architectures:
            return self._architectures[name]
        else:
            return ""

    def get_architectures(self):
        values = list(self._architectures.values())
        return values
