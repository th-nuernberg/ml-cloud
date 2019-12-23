from easygui import choicebox, multenterbox, codebox, fileopenbox, buttonbox, multchoicebox
import requests
import os
from requests.auth import HTTPBasicAuth
import json
import sys

username = "mario"
password = "super"

title = "Selection [" + username + "]"


def check_error(res):
    if res.status_code == 400:
        print("Bad request")
        return [""]
    if res.status_code == 401:
        print("Authentication error")
        return [""]
    elif res.status_code == 500:
        print("Server error")
        return [""]
    elif res.status_code == 404:
        print("Ressource not found")
        return [""]
    else:
        return json.loads(res.text)


def post(path, jsonConent=None):
    path = "http://127.0.0.1:5000/" + path
    r = ""
    if jsonConent is not None:
        r = requests.post(path, json=jsonConent, auth=HTTPBasicAuth(username, password))
    else:
        r = requests.post(path, auth=HTTPBasicAuth(username, password))

    return check_error(r)


def put(path, filepath=None):
    path = "http://127.0.0.1:5000/" + path
    r = ""

    if filepath is not None:
        file = {'file': open(filepath, 'rb')}
        r = requests.put(path, files=file, auth=HTTPBasicAuth(username, password))
    else:
        r = requests.put(path, auth=HTTPBasicAuth(username, password))

    return json.loads(r.text)


def get(path):
    path = "http://127.0.0.1:5000/" + path
    r = requests.get(path, auth=HTTPBasicAuth(username, password))

    return json.loads(r.text)


def upload_file(test=False):
    fileName = "test_file"
    if not test:
        msg = "Enter required information"
        title = "File creation"
        fieldNames = ["Filename"]
        fieldValues = multenterbox(msg, title, fieldNames)

        fileName = fieldValues[0]
        if fileName == "":
            return
    fileConfig = {}
    fileConfig["filename"] = fileName
    res = post("datasets", fileConfig)
    if not test:
        codebox(json.dumps(res, indent=2))

    dataset_id = res["dataset_id"]

    # Upload the actual file
    path = "datasets/" + dataset_id + "/bin/data"
    print("Dataset upload path: " + path)
    if not test:
        file_path = fileopenbox("Select dataset")
    else:
        file_path = os.path.join(os.path.abspath(os.path.dirname(sys.modules['__main__'].__file__)), "auto_test.csv")

    res = put(path, filepath=file_path)

    if not test:
        codebox(json.dumps(res, indent=2))
        return res
    return dataset_id


def create_view(DID=None, fieldValues=None):
    dataset_ids = get("datasets")

    test = DID != None
    if DID is None:
        DID = choicebox("Select the dataset for which to create a view", title, dataset_ids)

    if fieldValues is None:
        msg = "Enter column numbers (comma seperated)"
        fieldNames = ["Colum names", "Data colums", "Target colum"]
        fieldValues = multenterbox(msg, title, fieldNames)

    colum_names = []
    splitted = fieldValues[0].split(",")
    for name in splitted:
        colum_names.append(name)

    data_values = []
    splitted = fieldValues[1].split(",")
    for number in splitted:
        data_values.append(int(number))

    target_values = []
    splitted_target = fieldValues[2].split(",")
    for number in splitted_target:
        target_values.append(int(number))

    msg = {}
    msg["colum_names"] = colum_names
    msg["data_colums"] = data_values
    msg["target_colums"] = target_values
    msg["dataset_id"] = DID
    res = post("views", msg)

    if not test:
        codebox(json.dumps(res, indent=2))
    return res["view_id"]


def find_compatible_views():
    views = get("views")
    view_id = choicebox("Select view to check", title, views)

    compat_views = get("views/" + view_id + "/compatible_views")
    codebox(json.dumps(compat_views, indent=2))
    return


def create_job(architecture_id=None, entered_parameters=None, type=None, view_ids: list = None):
    test = type != None
    global title

    if architecture_id is None:
        architecture_list = get("architectures")
        architecture_id = choicebox("Select an architecture", title, architecture_list)

    if entered_parameters is None:
        archi_config = get("architectures/" + architecture_id)
        parameters = archi_config["parameters"]

        parameter_list = list(parameters.keys())
        default_list = []
        for key, value in parameters.items():
            default_list.append(value["default"])

        msg = "Enter required information"
        fieldValues = multenterbox(msg, title, parameter_list, default_list)

        entered_parameters = {}
        for name, value in zip(parameter_list, fieldValues):
            entered_parameters[name] = value

    if view_ids is None:
        views = get("views")
        view_ids = multchoicebox("Select views", title, views)

    if type is None:
        type = buttonbox("Please select the job type", title, ["test", "train"])

    architecture_config = {}
    architecture_config["parameters"] = entered_parameters

    res = post("architecture_configs", architecture_config)

    architecture_config_id = res["architecture_config_id"]

    job_config = {}

    job_config["architecture_config_id"] = architecture_config_id
    job_config["status"] = "not run"
    job_config["type"] = type
    job_config["view_ids"] = view_ids

    res = post("jobs", job_config)
    if not test:
        codebox(json.dumps(res, indent=2))
    return res["job_id"]


def show_all_experiments():
    experiments = get("experiments")
    experiment_id = choicebox("Select an experiment", title, experiments)
    job_configs = get("experiments/" + experiment_id + "/from_id_list/job_ids")

    codebox(json.dumps(job_configs, indent=2))


def create_experiment(job_selection=None):
    test = job_selection != None
    if job_selection is None:
        jobs = get("jobs")
        job_selection = multchoicebox("Select jobs", title, jobs)

    config = {}
    config["job_ids"] = job_selection
    res = post("experiments", config)
    if not test:
        codebox(json.dumps(res, indent=2))
    return res["experiment_id"]


def start_experiment():
    experiments = get("experiments")
    experiment_id = choicebox("Select an experiment", title, experiments)
    res = put("experiments/" + experiment_id + "/exec/start")
    codebox(json.dumps(res, indent=2))


def auto_test():
    file_id = upload_file(True)
    view_id = create_view(file_id, ["a,b,c", "0,1", "2"])
    job_id = create_job("test_architecture", {"dummyParam": "dummyValue"}, "test", [view_id])
    job_id2 = create_job("BinaryClassifier", {"dummyParam2": "dummyValue2"}, "test", [view_id])
    experiment_id = create_experiment([job_id, job_id2])
    print(get("experiments/" + experiment_id))


def get_credentials():
    global title
    msg = "Enter required information"
    title = "Authentication"
    fieldValues = multenterbox(msg, title, ["username", "password"])

    type = buttonbox("Is this a new user", "Create new user", ["yes", "no"])
    if type == "yes":
        content = {}
        content["username"] = fieldValues[0]
        content["password"] = fieldValues[1]
        post("users", content)


    title = "Selection [" + fieldValues[0] + "]"

    return fieldValues


while True:
    try:
        choices = ["Change credentials", "Upload a file", "Create a View", "Find compatible views", "Create a Job",
                   "Show experiment job-configs", "Create an Experiment", "Start an Experiment",  "Auto gen. Experiment",
                   "Exit"]
        choice = choicebox("What would you like to do?", title, choices)

        if choice == choices[0]:
            username, password = get_credentials()

        if choice == choices[1]:
            res = upload_file()

        if choice == choices[2]:
            res = create_view()

        if choice == choices[3]:
            find_compatible_views()

        if choice == choices[4]:
            create_job()

        if choice == choices[5]:
            show_all_experiments()

        if choice == choices[6]:
            create_experiment()

        if choice == choices[7]:
            start_experiment()

        if choice == choices[8]:
            auto_test()

        if choice == "Exit":
            break
    except Exception as e:
        print("An error occurred: " + str(e))
