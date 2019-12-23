FROM python:latest

RUN pip3 install flask \
    flask-RESTful \
    flask-Cors \
    paho-mqtt \
    pymongo \
    flask-HTTPAuth \
    jsonpatch 

COPY . /runtime
WORKDIR /runtime

EXPOSE 80
EXPOSE 5000


ENTRYPOINT cd /runtime && python3 main.py