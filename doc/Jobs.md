# Job-Typen

Das System unterscheidet zwei Job-Typen

## 1. Trainings-Job

Ein Trainings-Job nutzt einen Datensatz, welcher eine ausgefüllte Zielspalte besitzt, welche als targe_column angegeben wird. 
Das diese Spalte als Zielwert zu interpretieren ist, wird im Job über den typ (=train) festgelegt. 

Nach Durchführung des Trainings legt der Worker die trainierte Architektur auf der Architektur-Config Ressource ab, welche auch die Parameter enthält.
Auf die Job-Ressource können Log-Dateien gespeichert werden (z.B. unter /data/logs)

## 2. Evaluations-Job

Ein Evalutations-Job nutzt einen Datensatz, welcher eine leere Zielspalte besitzt. Diese wird durch den Worker mit den berechneten Werten ausgefüllt. 
Der Worker überschreibt den ursprünglichen Datensatz **NICHT**. Stattdessen speichert er den Datensatz im jeweiligen Job unter `/bin/generatedData`.