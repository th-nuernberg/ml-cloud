The controller offers a REST interface for the GUI and the Worker, acts as mqtt client 
and has a connection to a MongoDB-database.

The individual functionality is seperated into different folders:

- control: Responsible for job scheduling and worker assignments
- data: Responsible for interaction with MongoDB and modification of the stored information
- mqtt: Everything related to mqtt
- rest: Everything related to rest
- storage/models: Contains all available architectures and their configuration
- storage/users: Contains binary files uploaded via the REST api