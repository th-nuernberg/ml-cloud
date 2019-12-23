from flask import request, send_from_directory
from flask_restful import Resource
from werkzeug.security import check_password_hash
import traceback
import jsonpatch

import os
import sys

from control.Injector import Injector
from rest.StatusCodes import Status as S
from data.ViewCompat import get_compatible_views

from flask_httpauth import HTTPBasicAuth

REQUIRE_AUTHENTICATION = True
VERBOSE = True
auth = HTTPBasicAuth()


def xstr(s):
    if s is None:
        return "''"
    return str(s)

def logCall(method, path, jsonBody=None, extra=None, username=None):
    if VERBOSE:
        print(" * " + method + " on " + path + ", body: " + xstr(jsonBody) + ", extra: " + xstr(extra) + ", user=" + xstr(username))

@auth.verify_password
def verify_password(username, password):
    if not REQUIRE_AUTHENTICATION:
        print("!!!!!! AUTHENTICATION IS DISABLED !!!!! The default user 'mario' will be used for all requests.")

        return True

    if not (username and password):
        return False
    storageIO = Injector.storageIO
    entry = storageIO.find("users", {"name": username})

    if entry is None or not "hash" in entry:
        return False
    hash = entry["hash"]
    # We allow the clients to generate the hash and send it instead of the password // TODO serious security issue
    matches = (hash == password) or check_password_hash(hash, password)
    return matches


def logReturn(msg: str, status: S, error_desc: str = None):
    res = {}
    res["response"] = msg
    if error_desc is not None:
        res["desc"] = error_desc

    print(msg)
    return res, status

class BaseResource(Resource):
    _resource_name = "Not_set"
    _storageIO = None
    __DIR_ROOT = os.path.abspath(os.path.dirname(sys.modules['__main__'].__file__))
    __DIR_STORAGE = os.path.join(__DIR_ROOT, "storage", "users")

    def __init__(self, resource_name: str):
        self._resource_name = resource_name
        self._storageIO = Injector.storageIO

    @auth.login_required
    def post(self, id=None, content_type=None, extra=None):
        username = self._get_username()
        logCall(request.method, request.path, request.get_json(), extra, username)

        if id is not None or content_type is not None or extra is not None:
            return logReturn("You must not specify an ID in a POST request", S.METHOD_NOT_ALLOWED)

        try:
            jsonBody = request.get_json()  # May be empty
            if jsonBody == None or len(jsonBody) == 0:
                print("Received POST request is empty. (No Error, just for information)")

            content = self._storageIO.createEntry(self._resource_name, username, jsonBody)
            return content, S.CREATED
        except Exception as e:
            return logReturn("An error occured: " + str(e), S.INTERNAL_SERVER_ERROR)

    '''
    param id: the id of the entry. The resource name it refers to is stored in self._resource_name
    param content_type: Distinguishes what to perform. May be 'bin' for a binary file or 'exec' for execution
    param extra: The meaning of extra depends on the content_type. It could be the storage name for a binary file, or
                 the action to perform, eg. 'start'
    '''
    @auth.login_required
    def put(self, id, content_type=None, extra=None):
        username = self._get_username()
        logCall(request.method, request.path, request.get_json(), extra, username)
        jsonBody = request.get_json()  # May be empty

        if not self._isValidId(id):
            return None, S.BAD_REQUEST

        config_entry = self._storageIO.getEntry(self._resource_name, username, id)

        if id and not content_type:
            # Create/Update config_entry
            entry = self._storageIO.update(self._resource_name, username, id, jsonBody)
            return entry, S.OK
        else:
            if len(config_entry) == 0:
                return logReturn("Given id was not found", S.NOT_FOUND)
            if content_type == "bin" and extra is not None:
                file, code = self._extractFile(request)
                if code != S.OK:
                    return None, code
                self._storeFile(file, id, extra)
                return logReturn("Stored", S.OK)
            elif content_type == "exec":
                return self._start_jobs(self._resource_name, username, id, extra)
            else:
                return None, S.BAD_REQUEST

    @auth.login_required
    def get(self, id=None, content_type=None, extra=None):
        username = self._get_username()
        logCall(request.method, request.path, None, extra, username)

        try:
            if not id:
                ids = self._storageIO.getAllIds(self._resource_name, username)
                return ids, S.OK

            if id == "*":
                ids = self._storageIO.getAllIds(self._resource_name, username)
                return self._storageIO.getEntries(self._resource_name, username, ids)

            if not self._isValidId(id):
                return "Id is not valid", S.NOT_FOUND

            if content_type == "compatible_views" and self._resource_name == "view":
                compatible = get_compatible_views(self._storageIO, username, id)
                return compatible, S.OK
            elif content_type is not None and extra is not None:
                if content_type == "from_id_list":
                    # A subresource is requested
                    subRessource = extra.replace("_ids", "")
                    print("Redirection request to ressource " + subRessource)
                    entry = self._storageIO.getEntry(self._resource_name, username, id)
                    if len(entry) == 0 or extra not in entry:
                        return entry, S.NOT_FOUND
                    requested_ids = entry[extra]
                    return self._storageIO.getEntries(subRessource, username, requested_ids)
                elif content_type == "bin":
                    storage_path = os.path.join(self.__DIR_STORAGE, extra)
                    return send_from_directory(storage_path, id, as_attachment=True)
            # Else return id_entry
            entry = self._storageIO.getEntry(self._resource_name, username, id)
            if len(entry) == 0:
                return entry, S.NOT_FOUND
            return entry, S.OK
        except Exception as e:
            if str(e) == "Unauthorized":
                return "Unauthorized!", S.UNAUTHORIZED
            return logReturn("An error occured: " + str(e), S.INTERNAL_SERVER_ERROR)

    @auth.login_required
    def patch(self, id=None, content_type=None, extra=None):
        try:
            username = self._get_username()
            logCall(request.method, request.path, request.get_json(), extra, username)
            jsonBody = request.get_json()

            if not self._isValidId(id) or len(jsonBody) == 0:
                return None, S.BAD_REQUEST

            entry = self._storageIO.update(self._resource_name, username, id, jsonBody, True)
            return entry, S.OK
        except ValueError as e:
            print("Patch is not valid JSON: " + str(e))
            return str(e), S.BAD_REQUEST
        except jsonpatch.JsonPatchTestFailed as e:
            print("JSON patch test failed: " + str(e))
            return "Test failed: " +str(e), S.BAD_REQUEST
        except jsonpatch.JsonPatchConflict as e:
            print("Patch failed due to a conflict: " + str(e))
            return "Patch failed due to a conflict: " +str(e), S.BAD_REQUEST
        except jsonpatch.JsonPatchException as e:
            print("JSON patch is faulty: " + str(e))
            return "Invalid patch: " +str(e), S.BAD_REQUEST
        except Exception as e:
            return traceback.format_exc(), S.INTERNAL_SERVER_ERROR


    @auth.login_required
    def delete(self, id=None, content_type=None, extra=None):
        username = self._get_username()
        logCall(request.method, request.path, request.get_json(), extra, username)
        if not self._isValidId(id):
            return None, S.NOT_FOUND

        if content_type is None:
            success = self._storageIO.remove_entry(self._resource_name, username, id)
            if success:
                # Search for the id in the storage folders and remove all contents
                self._search_and_delete(id, self.__DIR_STORAGE)
                return None, S.OK
            else:
                return None, S.NOT_FOUND
        else:
            if content_type == "bin":
                if extra is None:
                    return logReturn("Missing argument after bin", S.BAD_REQUEST)
                storage_path = os.path.join(self.__DIR_STORAGE, extra, id)
                print("Deleting: " + storage_path)
                os.remove(storage_path)
                return None, S.OK

    def _isValidId(self, id):
        if id is None:
            return False

        if not len(id) == 24:
            print("ERROR. Received ID is not valid!")
            return False
        return True

    def _extractFile(self, request):
        if 'file' not in request.files:
            print("Upload request is not valid! (Missing key 'file')")
            return None, S.BAD_REQUEST
        file = request.files['file']
        if not file:
            print("Received file is empty!")
            return None, S.BAD_REQUEST
        file.seek(0, 2)
        file_length = file.tell()
        if file_length == 0:
            print("Received file is empty!")
            return None, S.BAD_REQUEST
        file.seek(0)  # Reset the data pointer
        if file.filename == '':
            print('No selected file')
            return None, S.BAD_REQUEST
        return file, S.OK

    def _search_and_delete(self, filename, folder):
        for root, subdirs, filenames in os.walk(folder):
            if filename in filenames:
                file_path = os.path.join(root, filename)
                print("Deleting file: " + file_path)
                os.remove(file_path)

            for subdir in subdirs:
                self._search_and_delete(filename, os.path.join(root, subdir))

    def _storeFile(self, file, id, folder):
        folder_path = os.path.join(self.__DIR_STORAGE, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        storage_path = os.path.join(folder_path, id)
        file.save(storage_path)

    def _start_jobs(self, table_name, username: str, id: str, command: str):
        job_list = []
        if table_name == "experiment":
            entry = self._storageIO.getEntry(table_name, username, id)
            job_list = entry["job_ids"]
        elif table_name == "job":
            job_list.append(id)
        else:
            return logReturn("Ressource " + table_name + " doesn't support the execution of jobs!", S.BAD_REQUEST)

        worker_control = Injector.workerControl
        if self._validate_jobs(job_list, username): # Validate the job before sheduling it
            worker_control.modify_job_state(job_list, command)
            return logReturn("Scheduled", S.OK)
        else:
            return logReturn("Job is invalid", S.UNAUTHORIZED)

    def _get_username(self):
        if not REQUIRE_AUTHENTICATION:
            return "mario"
        return request.authorization["username"]

    # This function validates that every entry in the job is actually owned by the calling user.
    # Therefore every entry in the job is queried. getEntry will abort in case of an invalid user
    def _validate_jobs(self, job_ids:list, username:str) -> bool:
        for job_id in job_ids:
            job_config = self._storageIO.getEntry("job", username, job_id)

            architecture_config_id = job_config["architecture_config_id"]
            view_ids = job_config["view_ids"]

            self._storageIO.getEntry("architecture_config", username, architecture_config_id)
            for view_id in view_ids:
                view = self._storageIO.getEntry("view", username, view_id)
                dataset_id = view["dataset_id"]
                self._storageIO.getEntry("dataset", username, dataset_id)

        return True # Will only be reached if non of the getEntry calls aborts



class Dataset(BaseResource):
    _name = "dataset"

    def __init__(self):
        super().__init__(self._name)

class View(BaseResource):
    _name = "view"

    def __init__(self):
        super().__init__(self._name)

class Experiment(BaseResource):
    _name = "experiment"

    def __init__(self):
        super().__init__(self._name)

class Job(BaseResource):
    _name = "job"

    def __init__(self):
        super().__init__(self._name)

class Architecture_config(BaseResource):
    _name = "architecture_config"

    def __init__(self):
        super().__init__(self._name)

class Architecture(BaseResource):
    _name = "architecture"
    _architectureIO = None
    __DIR_ROOT = os.path.abspath(os.path.dirname(sys.modules['__main__'].__file__))
    __DIR_ARCHITECTURES = os.path.join(__DIR_ROOT, "storage", "models")

    def __init__(self):
        super().__init__(self._name)
        self._architectureIO = Injector.architectureIO

    def post(self):
        return logReturn("Not supported", S.METHOD_NOT_ALLOWED)

    def put(self):
        return logReturn("Not supported", S.METHOD_NOT_ALLOWED)

    @auth.login_required
    def get(self, id=None, content_type=None, extra=None):
        if id is None:
            return self._architectureIO.get_architecture_list(), S.OK
        else:
            global REQUIRE_AUTHENTICATION
            if id == "*":
                return self._architectureIO.get_architectures(), S.OK
            elif id == "enableAuth": # TODO Quick hack to enable easy switching on or off the authentication
                REQUIRE_AUTHENTICATION = True
                print("AUTHENTICATION ENABLED")
                return "Enabled", S.OK
            elif id == "disableAuth":
                REQUIRE_AUTHENTICATION = False
                print("!!! AUTHENTICATION DISABLED !!!")
                return "Disabled", S.OK

            if content_type is None:
                config = self._architectureIO.get_architecture(id)
                if len(config) == 0:
                    return None, S.NOT_FOUND
                else:
                    return config, S.OK
            else:
                if content_type == "bin":
                    # Return the python file
                    architecture_name = id
                    storage_path = os.path.join(self.__DIR_ARCHITECTURES, architecture_name)
                    return send_from_directory(storage_path, architecture_name + ".py", as_attachment=True)


class User(Resource):

    def __init__(self):
        self._storageIO = Injector.storageIO

    def post(self):
        jsonBody = request.get_json()  # May be empty
        if jsonBody is None:
            return "No data received", S.BAD_REQUEST

        if (not "username" in jsonBody) or (not "password" in jsonBody):
            return "Missing data fields", S.BAD_REQUEST

        username = jsonBody["username"]
        password = jsonBody["password"]

        success = self._storageIO.add_user_to_db(username, password)
        if success:
            return logReturn("User created", S.OK)
        else:
            return logReturn("User already exists", S.CONFLICT)
