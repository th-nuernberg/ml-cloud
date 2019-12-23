# Übersicht
![Ressources_2](uploads/3a0772964ebea0d1a979b0565e11bfba/Ressources_2.png)

Obige Grafik zeigt lediglich das minimum benötigter Felder. Felder können beliebig erweitert werden.

[Ein beispielhafter Ablauf kann hier gefunden werden.](Flowcharts.md)

# Workflow

Die REST-Schnittstelle folgt dem offiziellen Standard [RFC 2616](https://www.ietf.org/rfc/rfc2616.txt)

Eine gute Zusammenfassung des Unterschieds von PUT und POST kann [hier gefunden werden.](https://restfulapi.net/rest-put-vs-post/)

Generell:
POST: Erstellt neuen Untereintrag einer Ressource. Die ID des Untereintrags wird hierbei NICHT angegeben. Der Body ist egal. Server antwortet mit einer Response.
Anwort ist Code 201 (CREATED).

PUT: Überschreibt einen Untereintrag einer Ressource, falls dieser Vorhanden ist. Ansonsten wird ein neuer Eintrag erstellt. Die ID des Eintrags muss im Pfad angegeben werden. Anwort ist Code 200 (OK) 

PATCH: Aktualisiert einen Wert innerhalb einer Unterressource. Der zu übertragene Inhalt muss ein JSON-Patch (RFC 6902) sein. [Siehe hier für eine gute Erklärung.](https://williamdurand.fr/2014/02/14/please-do-not-patch-like-an-idiot/)

Beispiel eines Patches zum Hinzufügen einer job_id:
```
[
    { "op": "add", "path": "/job_ids/0", "value": "<job_id1>" }
]
```

GET: Datenabfrage an Server

DELETE: Löscht 

PUT, POST, GET und PATCH liefern mindestens den Response-Teil zurück + die zusätzlich übertragenen Inhalte.

Zeitstempel folgen der ISO 8601 Struktur.

## 1. Austausch von Datensätzen (Die JSON-Konfiguration, nicht die Binärdatei).

Beispiel eines minimalen Untereintrags unter /datasets:
```
{
    "dataset_id": "1234",
    "date_created" : "2019-07-09T11:29:34",
    "date_changed" : "2019-07-09T11:29:34"
}
```

### REST-Structur: 

**POST: `/datasets`**

Erstellt einen neuen dataset-Eintrag inklusive optional übertragener Daten. Dieser Eintrag wird als Response zurückgegeben und enthält eine DATASET_ID.

<details>
  <summary>Aufruf mit CURL</summary>

```
curl --request POST \
  --url http://127.0.0.1:5000/datasets\
  --header 'content-type: application/json' \
  --data '{
	"foo": "bar"
}'
```

</details>

**PUT: `/datasets/<DATASET_ID>`**

Erstellt oder Aktualisiert einen Eintrag mit DATASET_ID. Dieser Eintrag wird als Response zurückgegeben und enthält eine DATASET_ID.
<details>
  <summary>Aufruf mit CURL</summary>

  ```
curl --request PUT \
  --url http://127.0.0.1:5000/datasets/<DATASET_ID>\
  --header 'content-type: application/json' \
  --data '{
	"foo": "bar"
}'
```

</details>

**GET: `/datasets`**

Liefert eine Liste aller DATASET_IDs zurück.

<details>
  <summary>Aufruf mit CURL</summary>

```
curl --request GET --url http://127.0.0.1:5000/datasets
```

</details>

**GET: `/datasets/<DATASET_ID>`**

Liefert einen dataset-Eintrag zurück.

<details>
  <summary>Aufruf mit CURL</summary>

```
curl --request GET --url http://127.0.0.1:5000/datasets/<DATASET_ID>
```

</details>


## 2. Austausch von Binärdateien (z.B. CSV-Datei)

Binärdateien werden über das Anhängen von `/bin/<TYP>` an einen REST-Pfad signalisiert. 
Es werden nur PUT und GET unterstützt! (POST würde die Erstellung eines Untereintrags unter TYP signalisieren. /bin/<TYP> ist aber bereits der Untereintrag).

Beispiele für Binärdatenaustausch:
- Upload eines Datensatzes test.csv: PUT auf /datasets/1234/bin/data
- Herunterladen des Datensatzes: GET auf /datasets/1234/bin/data

Der Datenaustausch erfolgt hierbei als enctype=multipart/form-data, bei welchem der Datensatz (wie bisher) als input type=file übertragen wird.

<details>
  <summary>Aufruf mit CURL</summary>

Upload
```
curl --request PUT \
  --url http://127.0.0.1:5000/datasets/<DATASET_ID>/bin/data \
  --header 'content-type: multipart/form-data; boundary=---011000010111000001101001' \
  --form file=
```

Download
```
curl --request GET \
  --url http://127.0.0.1:5000/datasets/<DATASET_ID>/bin/data
```

</details>


## 3. Austausch von views.

Eine view beschreibt den Aufbau eines datasets.

Beispiel eines minimalen Untereintrags unter /views:
```
{
    "view_id": "1234",
    "date_created" : "2019-07-09T11:29:34",
    "date_changed" : "2019-07-09T11:29:34"
}
```

REST-Structur: `/views`. Verwendung analog zu `/datasets`.

Zusätzliche Felder:
```
{
    "view_id": "2345",
    "name": "name_der_view",
    "column_names" : ["name", "alter", "geschlecht", "note"]
    "data_columns": [
        0, 1, 2
    ],
    "target_columns": [
        3
    ],
    "dataset_id: "XY"
}
````

### Verknüpfung von dataset und view:

Um eine view mit einem dataset zu verknüpfen reicht es, die dataset_id in der view zu hinterlegen.

### Abfrage kompatibler views:

Es kann vorkommen, dass kompatile Views entstehen. Kompatibilität bedeutet hierbei, dass die Spaltenindizes und -namen identisch sind. Die Abfrage kompatibler Views zu einer View mit ID 'XY' erfolgt über ein GET auf den Pfad `/views/XY/compatible_views`. Als Antwort wird eine Liste kompatibler View-IDs zurückgeliefert. Diese wird häufig leer sein.

## 4. Abfrage von Architekturen.

Architekturen beschreiben verfügbare Algorithmen. Die IDs der Architekturen weichen vom gewohnten Muster ab und sind menschenlesbar. Grund hierfür ist der Speicherort. Die Architekturen liegen nicht in der Datenbank sondern im Dateisystem. Die IDs werden auch nicht automatisch generiert sondern vom Ersteller der Architektur vergeben. Dieser muss die Einmaligkeit der ID sicherstellen

REST-Structur: `/architectures`. Analog zu `/datasets`. **Es werden nur GET-Anfragen unterstützt!**

Beispiel eines minimalen Untereintrags unter /architectures:
```
{
    "architecture_id": "architecture_XY",
    "date_created" : "2019-07-09T11:29:34",
    "date_changed" : "2019-07-09T11:29:34"
}
```

Zusätzliche Felder:
```
{
    "parameters": 
        {
            "batch_size": {
                "default": 10,
                "validation": {
                    "numeric": {
                        "type": "int",
                        "low": 1,
                        "high": 512
                    }
                }
            },
            "epochs": {
                "default": 10,
                "validation": {
                    "numeric": {
                        "type": "int",
                        "low": 1,
                        "high": 500
                    }
                }
            }
        }
}
```

## 5. Architectur_Configs

Architectur-Configs verweisen auf eine Architectur und enthalten die konfigurierte Parameter. 

REST-Structur: `/architecture_configs`. Verwendung analog zu `/datasets`.

```
{
    "architecture_config_id": "abcd",
    "date_created" : "2019-07-09T11:29:34",
    "date_changed" : "2019-07-09T11:29:34"
}
```

Zusätzliche Felder:
```
{
    "architecture_id" : "BinaryClassifier",
    "parameters": {
        "batch_size": 30,
        "learning_rate": 0.01
    },
    "has_trained_model" : false
}
```

## 6. Austausch von Jobs

Ein Job beschreibt eine Kombination aus View und Architektur-Konfiguration.
Zusätzlich ist hinterlegt, ob trainiert oder eine Vorhersage getroffen werden soll.

Ein Job kann mehrere View-IDs enthalten, wenn diese zueinander kompatibel sind.

REST-Structur: `/jobs`. Verwendung analog zu `/datasets`.

Beispiel eines minimalen Untereintrags unter /jobs:
```
{
    "job_id": "abcd",
    "date_created" : "2019-07-09T11:29:34",
    "date_changed" : "2019-07-09T11:29:34"
}
```

Zusätzliche Felder:
```
{
    "view_ids" : ["AB", "CD"],
    "type" : "train",
    "architecture_config" : "ABCD"
}
```


## 7. Austausch von Experimenten.

Ein Experiement beschreibt eine Liste von Jobs.

Beispiel eines minimalen Untereintrags unter /experiments:
```
{
    "experiment_id": "1234",
    "date_created" : "2019-07-09T11:29:34",
    "date_changed" : "2019-07-09T11:29:34"
}
```

REST-Structur: `/experiments`. Verwendung analog zu `/datasets`.

Zusätzliche Felder:
```
{
    "job_ids": [
        "a1b2-asdf",
        "x3a4-qwer",
        "1123-5813"
    ]
}
```

## Starten eines Experiments

Ein Experiment können gestartet werde, indem eine PUT Anfrage auf `experiments/<EID>/exec/start` ausgeführt wird. Dies signalisiert dem Controller die einzelnen Jobs auf Worker aufzuteilen. Über das Feld "status" kann der aktuelle Status des jeweiligen Jobs abgefragt werden. 


# Indirekte Abfrage von Inhalten über abweichende Ressourcen

Ressourcen können Ressourcenfremde IDs enthalten. Über diese IDs kann wiederum eine andere Ressource abgefragt werden.
Beispiel: Die Ressource EXPERIMENT enthält eine Liste von JOB-IDs. Es ist möglich alle JOB-Konfigurationen über das Experiment abzufragen.

Hierfür muss der Pfad wie folgt aufgebaut sein:

`/Ressource/<Ressourcen-ID>/from_id_list/<Unterliste>`

Für eine Liste der JOB-Konfigs also: `/experiments/ABCD/from_id_list/job_ids`. 

Das zurückgelieferte Ergebniss ist eine Liste aller einzelnen JOB-Konfigs, wie Beispielsweise:

```
[
    {
        "job_id": "a"
    },
    {
        "job_id": "b"
    }
]
```

Der Controller kennt die tatsächliche Beziehung zwischen den job_ids und der Ressource JOB nicht. Der Bezug wird erst über den Feldnamen der ID-Liste hergestellt, in dem die Zeichenkette '_ids' aus dem Listenschlüssel (job_ids) entfernt wird. Hieraus würde der Ressourcenname 'job' generiert werden. Auf diese Ressource wird dannach eine GET-Anfrage für alle enthaltenen IDs erzeugt und zurück gegeben.
