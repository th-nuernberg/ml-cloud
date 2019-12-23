Jobs are configured models.

## Rest
### Create a job

| Function                                    | Path     | Method | Returns                     | Tested                 |
|---------------------------------------------|----------|--------|-----------------------------|------------------------|
| Create a new job. (It will not be executed) | /job/new | POST   | job-id on success, else 201 | <ul><li>[x] </li></ul> |

```
{
    "internal_name": "architecture_XY",
    "parameters": [
        {
            "batch_size": 30
        },
        {
            "learning_rate": 0.01
        }
    ]
}
```

### Query job config
| Function         | Path        | Method | Returns        | Body | Tested                 |
|------------------|-------------|--------|----------------|------|------------------------|
| Query job config | /job/\<job-id\> | GET    | The job config |      | <ul><li>[ ] </li></ul> |

```
{
    "internal_name": "architecture_XY", 
    "job_id" : "abcd",
    "parameters": [
        {
            "batch_size": 30
        },
        {
            "learning_rate": 0.01
        }
    ]
}
```

### Get status of a job
| Function       | Path                    | Method | Returns                                                                              | Body | Tested                 |
|----------------|-------------------------|--------|--------------------------------------------------------------------------------------|------|------------------------|
| Get Job update | /jobs/status/\<job-id\> | GET| Status of the job with given id. Have a look in the table below for status messages. |      | <ul><li>[x] </li></ul> |

```
{
    "ststus": "Ok"
    "worker_status": "Fehler"
}
```