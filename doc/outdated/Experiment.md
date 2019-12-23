# DEPRECATED

# Experiment

An experiment is a collection of jobs executed on the same dataset. 

![Experiment](uploads/1876cb1688f8847491b2572969edc38d/Experiment.png)

## REST
### Query all experiments

| Function              | Path         | Method | Returns                             | Body | Tested                 |
|-----------------------|--------------|--------|-------------------------------------|------|------------------------|
| Query all experiments | /experiments | GET    | A JSON array of all experiment ids. |      | <ul><li>[x] </li></ul> |

Returns
```
[
    "Notenrelation",
    "Weiteres Experiment"
]
```

### Query all experiment-configs

| Function              | Path         | Method | Returns                             | Body | Tested                 |
|-----------------------|--------------|--------|-------------------------------------|------|------------------------|
| Query all experiments | /experiment_configs | GET    | A JSON array of all experiment configurations. |      | <ul><li>[x] </li></ul> |

Returns
```
[
    {
        "id" : "Notenrelation",
        "data_file": "a.csv",
        "view": 2,
        "job_ids": ["a1b2-asdf", "x3a4-qwer", "1123-5813"]
    },
    {
        "id": "Weiteres Experiment",
        "data_file": "a.csv",
        "view": 1,
        "job_ids": ["d8c7-b3k1", "foo-bar"]}
]
```

### Create, Delete, Get experiments

| Function                                          | Path                | Method          | Returns                                         | Body | Tested                 |
|---------------------------------------------------|---------------------|-----------------|-------------------------------------------------|------|------------------------|
| Creates/Gets/Deletes the experiment defined by id | /experiments/\<id\> | POST/GET/DELETE | A JSON object with the config for the given id. | JSON | <ul><li>[x] </li></ul> |

```
{
    "data_file": "a.csv",
    "view": 2,
    "job_ids": ["a1b2-asdf", "x3a4-qwer", "1123-5813"]
}
```

### Start an experiment

| Function            | Path                      | Method | Returns | Body | Tested                 |
|---------------------|---------------------------|--------|---------|------|------------------------|
| Start an experiment | /experiments/\<id\>/start | POST   |         |      | <ul><li>[x] </li></ul> |



## Storage on file system

Experiments are stored in the experiments.json in the users folder.

```
{
    "Notenrelation": {
        "data_file": "a.csv",
        "view": 2,
        "job_ids": ["a1b2-asdf", "x3a4-qwer", "1123-5813"]
    },
    "Weiteres Experiment": {
        "data_file": "a.csv",
        "view": 1,
        "job_ids": ["d8c7-b3k1", "foo-bar"]
    }
    
}
```