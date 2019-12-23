import pymongo
from bson.objectid import ObjectId
from bson import json_util
from werkzeug.security import generate_password_hash
from flask import abort
import json
from jsonpatch import JsonPatch


class StorageIO:
    _DATE_CREATED = "date_created"
    _DATE_CHANGED = "date_changed"
    _USER_NAME = "username"

    _USER_TABLE = "users"

    _FITER_NEW_ENTRY = [_DATE_CREATED, _DATE_CHANGED, _USER_NAME]

    users: dict = {
        "worker": "1234",
        "mario": "super"
    }

    def add_user_to_db(self, username, password):
        content = {}
        content["name"] = username
        content["hash"] = generate_password_hash(password)
        id_list = self.getAllIds(self._USER_TABLE, username)

        if len(id_list) == 0:
            self.createEntry(self._USER_TABLE, username, content)
            return True
        else:
            return False

    def toJson(self, content):
        json_string = json.dumps(content, sort_keys=True, indent=4, default=json_util.default)
        return json.loads(json_string)

    def __init__(self):
        domain = "mongodb://localhost:27017/"
        while True:
            try:
                print("Connecting to DB (" + domain + ")")
                self.myclient = pymongo.MongoClient(domain, serverSelectionTimeoutMS=2000)
                dblist = self.myclient.list_database_names()
                self.mydb = self.myclient["mydatabase"]
                print("Connection to DB established")
                self.myclient.list_database_names()
                break
            except:
                print("Could not connect to database. Trying other network instead")
                if "localhost" in domain:
                    domain = "mongodb://mongo:27017/"
                else:
                    domain = "mongodb://localhost:27017/"

        mycol = self.mydb["files"]
        mydict = {"name": "John", "address": "Highway 37"}

        x = mycol.insert_one(mydict)
        for username, pas in self.users.items():
            self.add_user_to_db(username, pas)

    def find(self, table_name: str, condition: dict):
        col = self.mydb[table_name]
        entries = col.find_one(condition)
        return entries

    def insert(self, table_name: str, content: dict):
        col = self.mydb[table_name]
        result = col.insert_one(content)
        return result.inserted_id

    def getAllIds(self, table_name:str, username:str):
        col = self.mydb[table_name]

        if username != "worker":
            ids = col.find({"username": username}).distinct('_id')
        else:
            ids = col.find().distinct('_id')
        idStringList = []
        for id in ids:
            idStringList.append(str(id))
        return idStringList

    def getEntries(self, table_name, username:str, ids: list):
        collection = []
        for id in ids:
            entry = self.getEntry(table_name, username, id)
            collection.append(entry)
        return collection

    def getEntry(self, table_name, username:str, id):
        col = self.mydb[table_name]
        entry = col.find_one({'_id': ObjectId(id)})
        if entry is None or len(entry) == 0:
            return {}

        if not self._is_user_valid(username, entry["username"]):
            abort(401)

        objectId = entry["_id"]
        timestamp = entry[self._DATE_CHANGED]
        json = self.toJson(entry)
        del json["_id"]
        del json[self._DATE_CHANGED]
        json[table_name + "_id"] = str(objectId)
        json[self._DATE_CREATED] = objectId.generation_time.replace(tzinfo=None).isoformat()
        json[self._DATE_CHANGED] = timestamp.isoformat()
        return json

    def createEntry(self, table_name, username: str, jsonContent=None):
        if jsonContent is None:
            jsonContent = {}
        else:
            filter_list_copy = self._FITER_NEW_ENTRY + [table_name + "_id"]
            jsonContent = self._removeDisallowedEntries(jsonContent, filter_list_copy)

        result = self._update(table_name, username, None, jsonContent)
        if result.upserted_id == None:
            # Updated
            return

        id = result.upserted_id
        entry = self.getEntry(table_name, username, id)
        return entry

    def doesEntryExist(self, table_name, id):
        return len(self.getEntry(table_name, id)) != 0

    def update(self, table_name: str, username: str, id: str, jsonContent: dict, is_patch=False):
        if jsonContent is None:
            jsonContent = {}
        else:
            filter_list_copy = self._FITER_NEW_ENTRY + [table_name + "_id"]
            jsonContent = self._removeDisallowedEntries(jsonContent, filter_list_copy)

        if is_patch:
            self._patch(table_name, username, id, jsonContent)
        else:
            self._update(table_name, username, id, jsonContent)
        return self.getEntry(table_name, username, id)

    def remove_entry(self, table_name, username:str, id):
        old_entry = self.getEntry(table_name, username, id)
        col = self.mydb[table_name]
        result = col.delete_one({'_id': ObjectId(id)})
        return result.deleted_count == 1

    def _patch(self, table_name: str, username: str, id: str, patch: list):
        old_entry = self.getEntry(table_name, username, id)

        jsonPatch = JsonPatch(patch)
        modifiedEntry = jsonPatch.apply(old_entry)

        return self._update(table_name, username, id, modifiedEntry)

    def _update(self, table_name: str, username: str, id: str, jsonContent: dict):
        old_entry = self.getEntry(table_name, username, id)
        original_user = username

        if (old_entry is not None) and ("username" in old_entry):
            original_user = old_entry["username"]

        set, unset = self._create_diff(jsonContent, old_entry, table_name)

        myquery = {'_id': ObjectId(id)}
        newvalues = {}

        newvalues["$currentDate"] = {}
        newvalues["$currentDate"][self._DATE_CHANGED] = True
        set["username"] = original_user
        if len(set) > 0:
            newvalues["$set"] = jsonContent

        if len(unset) > 0:
            newvalues["$unset"] = unset

        col = self.mydb[table_name]
        result = col.update_one(myquery, newvalues, upsert=True)
        return result

    def _is_user_valid(self, requesting_user, owner):
        return requesting_user == owner or requesting_user == "worker"

    def _create_diff(self, new_content: dict, old_content: dict, table_name: str):
        unset = {}

        if len(old_content) > 0:
            del old_content[table_name + "_id"]
            for oldEntry in old_content:
                if not oldEntry in new_content:
                    unset[oldEntry] = ""

        self._removeDisallowedEntries(new_content, self._FITER_NEW_ENTRY)
        self._removeDisallowedEntries(unset, self._FITER_NEW_ENTRY)

        return new_content, unset

    def _removeDisallowedEntries(self, jsonContent: dict, filterList: list):
        for entry in filterList:
            if entry in jsonContent:
                del jsonContent[entry]

        return jsonContent

    def update_job_status(self, job_id: str, status: str):
        changes = []
        add = {"op": "add", "path": "/status", "value": status}
        replace = {"op": "replace", "path": "/status", "value": status}
        changes.append(add)
        changes.append(replace)
        self.update("job", "worker", job_id, changes, True)
