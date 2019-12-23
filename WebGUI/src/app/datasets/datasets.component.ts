import {
    Component,
    OnInit
} from '@angular/core';
import {
    RestService
} from '../rest.service';
import {
    ModalService
} from '../modal';

@Component({
    selector: 'app-datasets',
    templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.css']
})
export class DatasetsComponent implements OnInit {

    //REST
    datasetsRest: string[];
    viewsRest: string[];
    file: File;
    datasetName: string = "";
    viewName = "";
    createViewMode: boolean = false;
    showViewMode: boolean = false;
    showDatasetMode: boolean = false;
    uploadDatasetMode: boolean = false;
    createViewLevel = "";
    // alt
    data = null;
    headers = [];
    xHeaders = [];
    yHeaders = [];
    hasHeaders: boolean = false;
    selectedXColumns = [];
    selectedYColumn = [];
    selectedViewDatasetName = "";
    viewDataset: string[];
    viewData = [];
    viewsOfDataset = [];
    xColumnData = [];
    yColumnData = [];
    loading: boolean = false;
    headerRadio;

    selectedDataset: string[];
    selectedView: string[];

    constructor(private rest: RestService, private modalService: ModalService) {}


    ngOnInit() {
        localStorage.clear();
        // get all datasets to show
        this.rest.getAll('datasets').subscribe((resp: string[]) => {
            this.datasetsRest = resp;
        });

        // get all views to show
        this.rest.getAll('views').subscribe((resp: string[]) => {
            this.viewsRest = resp;
        });

    }

    //disclaimers
    openModal(id: string, objectID: string, name: string, expID: string) {
        this.modalService.open(id, objectID, name, expID);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    //loading screen
    startLoading() {
        this.loading = true;
    }

    stopLoading() {
        this.loading = false;
    }


    onDatasetSelect(event: Event): void {
        this.startLoading();
        this.data = [];
        // selected datasetID
        let id = (event.target as Element).id;
        this.rest.getType('datasets', id).subscribe((resp: string[]) => {
            this.selectedDataset = resp;
            this.datasetName = this.selectedDataset['filename'];
            this.viewsOfDataset = [];
            this.hasHeaders = this.selectedDataset['has_headers'];
            for (let view of this.viewsRest) {
                if (view['dataset_id'] == id) {
                    this.viewsOfDataset.push(view['view_name']);
                }
            }
            this.rest.getDataset(id).subscribe((resp: Blob) => {
                let datasetData = resp;
                this.readFile(datasetData, false);
                // changeMode
                this.createViewMode = false;
                this.showViewMode = false;
                this.showDatasetMode = true;
                this.uploadDatasetMode = false;
            });
        });
    }

    onViewSelect(id: string): void {
        this.startLoading();
        this.data = [];
        // selected viewID
        //let id = (event.target as Element).id;
        this.rest.getType('views', id).subscribe((resp: string[]) => {
            this.selectedView = resp;
            let datasetID = this.selectedView['dataset_id'];
            this.rest.getType('datasets', datasetID).subscribe((resp: string[]) => {
                this.viewDataset = resp;
                this.selectedViewDatasetName = this.viewDataset['filename'];
                this.hasHeaders = this.viewDataset['has_headers'];
                this.rest.getDataset(datasetID).subscribe((resp: Blob) => {
                    this.readFile(resp, true);
                    // changeMode
                    this.createViewMode = false;
                    this.showViewMode = true;
                    this.showDatasetMode = false;
                    this.uploadDatasetMode = false;
                });
            });
        });
    }

    setupViewMode(view: string[]) {
        // new view new data
        this.xColumnData = [];
        this.yColumnData = [];
        this.xHeaders = [];
        this.yHeaders = [];
        let line = [];
        let yline = [];
        let xHeaders = this.xHeaders;
        let yHeaders = this.yHeaders;

        //iterate through every row of the dataset one by one
        for (let row of this.data) {
            line = [];
            yline = [];
            //iterate through every column, check if index is saved in data_columns/value_columns. if yes, add value to view at index
            row.forEach(function (value, index) {
                if (view['data_columns'].includes(index)) {
                    line.push(value);
                }
                if (view['target_columns'].includes(index)) {
                    yline.push(value);
                }
            });
            this.xColumnData.push(line);
            this.yColumnData.push(yline);
        }

        //fill header array with headers of view columns
        this.headers.forEach(function (head, index) {
            if (view['data_columns'].includes(index)) {
                xHeaders.push(head);
            } else if (view['target_columns'].includes(index)) {
                yHeaders.push(head);
            }
        });
        for (var i = 0; i < this.yColumnData.length; i++) {}
    }

    createNewDataset(): void {
        this.data = null;
        this.hasHeaders = false;
        this.createViewMode = false;
        this.showViewMode = false;
        this.showDatasetMode = false;
        this.uploadDatasetMode = false;
    }

    createView(): void {
        this.createViewMode = true;
        this.showViewMode = false;
        this.showDatasetMode = false;
        this.uploadDatasetMode = false;
        this.createViewLevel = "selectXColumns";
    }

    cancelNewView(): void {
        this.createViewMode = false;
        this.showViewMode = false;
        this.showDatasetMode = true;
        this.uploadDatasetMode = false;
        this.viewName = "";
        this.selectedXColumns = [];
        this.selectedYColumn = [];
        this.createViewLevel = "selectXColumns";
    }

    //fires when user uses the create-view-slider: createViewLevel changes according to which actions user needs to take
    changeCreateViewLevel(level): void {
        switch (level) {
            case "selectXColumns":
                this.createViewLevel = "selectXColumns";
                break;
            case "selectYColumns":
                this.createViewLevel = "selectYColumns";
                break;
            case "enterViewname":
                this.createViewLevel = "enterViewname";
                break;
            case "checkAndSave":
                this.createViewLevel = "checkAndSave";
                break;
        }
    }

    saveNewView(): void {
        if (!this.viewName) {
            this.viewName = this.datasetName + "-View";
        }

        let viewConfig = {
            "dataset_id": this.selectedDataset['dataset_id'],
            "view_name": this.viewName,
            "data_columns": this.selectedXColumns,
            "target_columns": this.selectedYColumn,
            "column_names": this.headers,
        };

        this.rest.postType('views', viewConfig).subscribe((resp: string[]) => {
            this.selectedView = resp;
            this.selectedXColumns = [];
            this.selectedYColumn = [];
            this.hasHeaders = false;
            this.headers = [];
            this.viewName = "";
            this.createViewMode = false;
            // update views
            this.rest.getAll('views').subscribe((resp: string[]) => {
                this.viewsRest = resp;
            });
            this.onViewSelect(this.selectedView['view_id']);
            // changeMode
            this.createViewMode = false;
            this.showViewMode = true;
            this.showDatasetMode = false;
            this.uploadDatasetMode = false;
        });
    }

    saveDataset(): void {
        //        if (this.hasHeaders == false) this.headers = [];
        let datasetConfig = {
            "filename": this.datasetName,
            "has_headers": this.hasHeaders
        };
        this.rest.postType('datasets', datasetConfig).subscribe((resp: string[]) => {
            this.selectedDataset = resp;
            let datasetID = this.selectedDataset['dataset_id'];

            this.rest.putDataset(this.file, datasetID).subscribe((resp: string[]) => {
                // change Mode
                this.createViewMode = false;
                this.showViewMode = false;
                this.showDatasetMode = true;
                this.uploadDatasetMode = false;
                this.headerRadio = false;
                //update Datasets
                this.rest.getAll('datasets').subscribe((resp: string[]) => {
                    this.datasetsRest = resp;
                });
            });
        });

    }


    //fires when user clicks on a table column while creating a view to select data or labels
    selectColumn(event: Event): void {
        let elementIdString: string = (event.target as Element).id;
        let elementId: number = +elementIdString.split(".")[1];
        if (this.createViewMode == true) {
            //select data
            if (this.createViewLevel == "selectXColumns") {
                if (!this.selectedXColumns.includes(elementId) && !this.selectedYColumn.includes(elementId)) {
                    this.selectedXColumns.push(elementId);
                } else if (this.selectedXColumns.includes(elementId)) {
                    this.selectedXColumns.splice(this.selectedXColumns.indexOf(elementId), 1);
                }
                //select labels
            } else if (this.createViewLevel == "selectYColumns") {
                if (!this.selectedYColumn.includes(elementId) && !this.selectedXColumns.includes(elementId)) {
                    this.selectedYColumn.push(elementId);
                } else if (this.selectedYColumn.includes(elementId)) {
                    this.selectedYColumn.splice(this.selectedYColumn.indexOf(elementId), 1);
                }
            }
        }
    }


    public changeListener(files: FileList) {
        this.startLoading();
        this.createViewMode = false;
        this.showViewMode = false;
        this.showDatasetMode = false;
        this.uploadDatasetMode = true;
        if (files && files.length > 0) {
            this.file = files.item(0);
            this.datasetName = this.file.name
            this.readFile(this.file, false);
        }
    }

    readFile(file: any, isView: boolean): void {
        let reader: FileReader = new FileReader();
        reader.readAsText(file);

        reader.onload = (e) => {
            let csv: string = reader.result as string;
            var typeOfSeparator = "comma";
            var allTextLines = csv.split(/\r\n|\n/); //split all rows into separate strings

            //split on comma
            var headers = allTextLines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (headers.length == 1) {
                //split on semicolon
                typeOfSeparator = "semicolon";
                var headers = allTextLines[0].split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            }
            this.headers = headers;

            var lines = [];

            //all data lines
            //for (var i = 0; i < allTextLines.length; i++) {
            //100 data lines
            for (var i = 0; i < 100; i++) {
                if (i == allTextLines.length) {
                    break;
                }
                // split content based on comma
                if (typeOfSeparator == "comma") {
                    var data = allTextLines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                } else if (typeOfSeparator == "semicolon") {
                    var data = allTextLines[i].split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                }

                var tarr = [];
                for (var j = 0; j < headers.length; j++) {
                    //tarr.push(data[j].trim());
                    tarr.push(data[j]);
                }
                lines.push(tarr);
            }
            if (this.hasHeaders) {
                // remove first line = header line
                lines.shift();
            }
            this.data = lines;
            if (isView) {
                if (!this.hasHeaders) {
                    this.headers = [];
                }
                this.setupViewMode(this.selectedView);
            }
            this.stopLoading();
        }

    }

    renameDataset() {
        let config = {
            "filename": this.datasetName
        };
        this.rest.putType('datasets', this.selectedDataset['dataset_id'], config).subscribe((resp: string[]) => {
            this.selectedDataset = resp;
            // update datasets
            this.rest.getAll('datasets').subscribe((resp: string[]) => {
                this.datasetsRest = resp;
            });
        });
    }


    //fires when user selects a header checkbox
    onItemChange(value) {
        switch (value) {
            case "noheaders":
                this.hasHeaders = false;

                var same = true;
                for (var i = 0; i < this.data[0].length; i++) {
                    if ((this.data[0][i]) != (this.headers[i])) {
                        same = false;
                    }
                }
                if (same == false) {
                    var addHeaderLineToData = this.data.unshift(this.headers);
                }
                break;
            case "hasheaders":
                this.hasHeaders = true;
                var removeHeaderLineFromData = this.data.shift();
                break;
        }
    }

    onDeleteView(id: string) {
        this.rest.deleteType('views', id).subscribe((resp: string[]) => {
            this.rest.getAll('views').subscribe((resp: string[]) => {
                // aktualisieren
                this.viewsRest = resp;
                this.createNewDataset();
            });
        });
    }

    onDeleteDataset(id: string) {
        // Delete all views of dataset
        this.rest.getAll('views').subscribe((resp: string[]) => {
            let views = resp;
            for (let view of views) {
                if (view['dataset_id'] == id) {
                    this.rest.deleteType('views', view['view_id']).subscribe((resp: string[]) => {
                        this.rest.getAll('views').subscribe((resp: string[]) => {
                            // aktualisieren
                            this.viewsRest = resp;
                        });
                    });
                }
            }

            this.rest.deleteType('datasets', id).subscribe((resp: string[]) => {
                this.rest.getAll('datasets').subscribe((resp: string[]) => {
                    // aktualisieren
                    this.datasetsRest = resp;
                    this.createNewDataset();
                });
            });
        });
    }

    //    onDownloadFile(id: string, name: string) {
    //        this.rest.getDatasetCsv(id).subscribe((resp: any) => {
    //            const blob: Blob = new Blob([resp], {
    //                type: 'text/csv'
    //            });
    //            const fileName: string = name;
    //            const objectUrl: string = URL.createObjectURL(blob);
    //            const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;
    //
    //            a.href = objectUrl;
    //            a.download = fileName;
    //            document.body.appendChild(a);
    //            a.click();
    //
    //            document.body.removeChild(a);
    //            URL.revokeObjectURL(objectUrl);
    //
    //            //            let blob = new Blob([resp], {
    //            //                type: 'text/csv'
    //            //            });
    //            //            const url = window.URL.createObjectURL(blob);
    //            //            window.open(url);
    //        });
    //    }

    //    downloadFile(data: Response) {
    //        const blob = new Blob([data], {
    //            type: 'text/csv'
    //        });
    //        const url = window.URL.createObjectURL(blob);
    //        window.open(url);
    //    }

}
