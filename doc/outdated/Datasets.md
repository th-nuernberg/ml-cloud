# DEPRECATED

Datasets are Datafiles and a view describing its columns and structure.

# Rest
## Query all datafiles
| Function                | Path   | Method | Returns | Body | Tested                 |
|-------------------------|--------|--------|---------|------|------------------------|
| Get a list of all files | /files | GET    | JSON    |      | <ul><li>[x] </li></ul> |

```
[
    "a.csv", "b.csv"
]
```

## Upload and download of datafiles

The filename must have an ending. The ending is checked for validation. Allowed files endings are e.g. txt, pdf, csv.

| Function                    | Path                | Method          | Returns | Body                                            | Tested                 |
|-----------------------------|---------------------|-----------------|---------|-------------------------------------------------|------------------------|
| Upload/Download/Delete file | /files/\<filename\> | POST/GET/DELETE |         | enctype=multipart/form-data und input type=file | <ul><li>[x] </li></ul> |

## Create and Query views
| Function            | Path                       | Method   | Returns | Body                                                                                            | Tested                 |
|---------------------|----------------------------|----------|---------|-------------------------------------------------------------------------------------------------|------------------------|
| Post/Get fileconfig | /files/\<filename\>/config | POST/GET | JSON    | [Dataset-config](https://gitlab.com/DrDOIS/it_projekt/wikis/Configuration#configuring-datasets) | <ul><li>[x] </li></ul> |

```
{
    "config": {
        "filename": "a.csv",
        "headings": ["name", "alter", null, "klasse", "note", "note_leer"],
        "views": [
            {
                "name": "optional_name",
                "data": ["alter", "klasse"],
                "labels": ["note"],
                "predict":[]
            },
            {
                "data": ["alter", "klasse"],
                "labels": [],
                "predict":["note_leer"]
            }
        ]
    }
}

```