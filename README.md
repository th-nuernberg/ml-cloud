# IT_Projekt
## Goal
Developement of a distributed machine learning platform.
For an detailed description of this project, its features and functionality [have a look here. (German)](doc/Description.md)

### Features
A detailed list of goals of this project [can be found here.](doc/Features.md)

### System architecture
The system architecture can be [found here.](doc/Architectures.md)

### Job Types
The system supports two types of jobs. One is training and the other one is prediction.
[See here for details.](doc/Jobs.md)

## REST overview
The latest version of the REST documentation [can be found here.](doc/REST.md)
Authentication related informaton can be found [here](doc/Authentication.md)

# Getting started
Requirements: 
- docker-compose

For install instructions for the individual components have a look at the Dockerfile in the subfolders.

Execute `docker-compose up` to start an instance of the controller, worker, webgui, mongodb and mosquitto broker. 
The webgui can be reached at 127.0.0.1:4200
