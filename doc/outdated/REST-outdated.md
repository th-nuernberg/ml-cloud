
# DEPRECATED! DO NOT USE

This document described the RESR-API.


| Function                                    | Path                          | Method   | Returns                                                                                                                                              | Body                                                                                                      | Tested                 |
|---------------------------------------------|-------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|------------------------|
| Query all models                            | /models/all                   | get      | ALL models. Jobs configured by the user will have a job-id.                                                                                          |                                                                                                           | <ul><li>[x] </li></ul> |
| Query some models                           | /models/range/\<from\>/\<to\> | get      | A list of models which are stored in range starting from \<from\> to \<to\> (from is included, to is excluded). (Pre)trained jobs will have a job-id |                                                                                                           | <ul><li>[ ] </li></ul> |
| Create a new job. (It will not be executed) | /job/new                      | POST     | job-id on success, else 201                                                                                                                          | [Job config](https://gitlab.com/DrDOIS/it_projekt/wikis/Configuration#config-used-for-starting-a-new-job) | <ul><li>[x] </li></ul> |
| Query job config                            | /job/\<id\>                   | GET      | The job config                                                                                                                                       |                                                                                                           | <ul><li>[ ] </li></ul> |
| Get Job update                              | /jobs/status/\<job-id\>       | get      | Status of the job with given id. Have a look in the table below for status messages.                                                                 |                                                                                                           | <ul><li>[x] </li></ul> |
| Download/upload the model                   | /model/\<job_id\>             | get/post | WORKER ONLY! Upload/Download model. Download will return either the untrained or the trained one.                                                    | enctype=multipart/form-data und input type=file                                                           | <ul><li>[ ] </li></ul> |
### Data files
For each data file a fileconfig is generated and exchanged with the backend. Available REST calls can be seen in the table below.
The fileconfig contains a general description of the headings and available views (Assignments of columns).

| Function                    | Path                       | Method          | Returns                 | Body                                                                                            | Tested                 |
|-----------------------------|----------------------------|-----------------|-------------------------|-------------------------------------------------------------------------------------------------|------------------------|
| Get a list of all files               | /files                     | GET             |    JSON   |                                                                                                 | <ul><li>[x] </li></ul> |
| Upload/Download/Delete file | /files/\<filename\>        | POST/GET/DELETE |   | enctype=multipart/form-data und input type=file                                                 | <ul><li>[x] </li></ul> |
| Post/Get fileconfig         | /files/\<filename\>/config | POST/GET        |    JSON                 | [Dataset-config](https://gitlab.com/DrDOIS/it_projekt/wikis/Configuration#configuring-datasets) | <ul><li>[x] </li></ul> |

### Experiments

| Function                                          | Path                      | Method          | Returns         | Body | Tested                 |
|---------------------------------------------------|---------------------------|-----------------|-----------------|------|------------------------|
| Creates/Gets/Deletes the experiment defined by id | /experiments/\<id\>       | POST/GET/DELETE | A JSON object with the config for the given id.           | JSON | <ul><li>[x] </li></ul> |
| Query all experiments                             | /experiments              | GET             | A JSON array of all experiment ids. | | <ul><li>[x] </li></ul> |
| Start an experiment                               | /experiments/\<id\>/start | POST            |                 |      | <ul><li>[x] </li></ul> |

### Worker

| Function                                        | Path    | Method | Returns | Body | Tested                 |
|-------------------------------------------------|---------|--------|---------|------|------------------------|
| Get a summary of the controller and all workers | /worker | GET    | JSON    |      | <ul><li>[ ] </li></ul> |

## Status messages

Status messages in steps 1-3 will only contain the JSON-key "status". All other status messages include a "worker_status" field.

### Status messages is "status" field

| Message  | Meaning                                                                                                                                                                        | Step number |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| stored   | The config is stored and will be avaiable upon next model request.                                                                                                             | 1           |
| planned  | The config is in the pending job queue and waiting for a worker to pick it up.                                                                                                 | 2           |
| failed   | There are too many planned jobs (currently the queue supports two elements).                                                                                                   | 2           |
| assigned | The config was assigned to a worker and is waiting to be confirmed.                                                                                                            | 3           |
| accepted | A worker accepted the config and is now acquiring all necessary resources to start the job. Future status messages will originate from the worker and include additional data. | 4           |

### Status messages in "worker_status" field
| Message          | Meaning                                                                                   | Step number |
|------------------|-------------------------------------------------------------------------------------------|-------------|
| lost             | The worker assigned for the job has gone missing. (No resheduling is implemented yet.)    | 5           |
| exception        | Worker experienced an exception. (The job is aborted. Handled as if the worker went lost) | -           |
| fetching_dataset | Worker is loading the dataset.                                                            | 6           |
| fetching_model   | Worker is loading the model.                                                              | 7           |