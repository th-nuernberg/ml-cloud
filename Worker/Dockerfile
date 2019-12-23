FROM python:3.7.4-buster

RUN pip3 install paho-mqtt \
    requests \
    "tensorflow==1.14" \
    keras \
    "numpy<1.17"

COPY . /runtime
WORKDIR /runtime

ENTRYPOINT cd /runtime && python3 main.py