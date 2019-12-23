import {
    Component,
    OnInit
} from '@angular/core';
import {
    RestService
} from '../rest.service';

@Component({
    selector: 'app-training-label',
    templateUrl: './training-label.component.html',
    styleUrls: ['./training-label.component.css']
})
export class TrainingLabelComponent implements OnInit {

    public parentLabel: boolean = true;
    datasetFile: Blob;
    datasetIDRest: string;
    datasetRest: string[];
    viewRest: string[];
    viewIDRest: string;
    viewString: string;

    // datasets.ts
    data = null;
    headers = [];
    xHeaders = [];
    yHeaders = [];
    selectedXColumns = [];
    selectedYColumn = [];
    yCheckbox = false;
    createViewMode: boolean;
    saveViewMode: boolean;
    viewName: string = "";
    datasetName: string = "";
    hasHeaders: boolean = false;
    headerRadio = null;

    loading: boolean = false;

    constructor(private rest: RestService) {}

    ngOnInit() {
        this.datasetIDRest = localStorage.getItem('datasetID');
        this.viewIDRest = localStorage.getItem('viewID');
        if (this.datasetIDRest || this.viewIDRest) {
            this.startLoading();
        }
        if (this.datasetIDRest) {
            this.createViewMode = true;
            this.saveViewMode = false;
            this.rest.getType('datasets', this.datasetIDRest).subscribe((resp: string[]) => {
                this.datasetRest = resp;
                this.datasetName = this.datasetRest['filename'];
                this.hasHeaders = this.datasetRest['has_headers'];
                this.rest.getDataset(this.datasetIDRest).subscribe((resp: Blob) => {
                    this.datasetFile = resp;
                    this.readFile(this.datasetFile, false);
                });
            });
        } else if (this.viewIDRest) {
            this.createViewMode = false;
            this.saveViewMode = true;
            this.rest.getType('views', this.viewIDRest).subscribe((resp: string[]) => {
                this.viewRest = resp;
                this.viewIDRest = this.viewRest['view_id'];
                this.selectedXColumns = this.viewRest['data_columns'];
                this.selectedYColumn = this.viewRest['target_columns'];
                let headers = this.viewRest['column_names'];
                if (headers.length <= 0) {
                    this.hasHeaders = false;
                } else {
                    this.hasHeaders = true;
                }
                this.viewName = this.viewRest['view_name'];
                this.viewString = "View Name: '" + this.viewName + "' ;  Data: " + this.selectedXColumns + " ;  Label: " + this.selectedYColumn;
                this.datasetIDRest = this.viewRest['dataset_id'];
                this.rest.getDataset(this.datasetIDRest).subscribe((resp: Blob) => {
                    this.datasetFile = resp;
                    this.readFile(this.datasetFile, true);
                });
            });
        }
    }

    startLoading() {
        this.loading = true;
    }

    stopLoading() {
        this.loading = false;
    }


    cancelNewView(): void {
        this.data = null;
        this.createViewMode = true;
        this.saveViewMode = false;
        this.headers = null;
        this.selectedXColumns = [];
        this.selectedYColumn = [];
    }

    datasetID: number;
    xColumnData = [];
    yColumnData = [];
    saveNewView(): void {
        this.viewString = "View Name: '" + this.viewName + "' ;  Data: " + this.selectedXColumns + " ;  Label: " + this.selectedYColumn;

        let viewConfig = {
            "dataset_id": this.datasetIDRest,
            "view_name": this.viewName,
            "data_columns": this.selectedXColumns,
            "target_columns": this.selectedYColumn,
            "column_names": this.headers
        };

        if (this.viewIDRest) {
            // if view(ID) already exists update/put
            this.rest.putType('views', this.viewIDRest, viewConfig).subscribe((resp: string[]) => {
                let viewRest = resp;
                this.setupViewMode(viewRest);
                this.createViewMode = false;
            });
        } else {
            // else new/post
            this.rest.postType('views', viewConfig).subscribe((resp: string[]) => {
                let viewRest = resp;
                this.viewIDRest = viewRest['view_id'];
                this.setupViewMode(viewRest);
                localStorage.removeItem('datasetID');
                localStorage.setItem('viewID', this.viewIDRest);
                this.createViewMode = false;
            });
        }

    }


    setupViewMode(viewRest: string[]) {
        this.xColumnData = [];
        this.yColumnData = [];
        this.xHeaders = [];
        this.yHeaders = [];
        let xColumnData = this.xColumnData;
        let xHeaders = this.xHeaders;
        let yColumnData = this.yColumnData;
        let yHeaders = this.yHeaders;
        let line = [];
        let yline = [];
        //iterate through every row of the dataset one by one
        this.data.forEach(function (row) {
            line = [];
            yline = [];
            //iterate through every column, check if index is saved in data_columns/value_columns. if yes, add value to view at index
            row.forEach(function (value, index) {
                if (viewRest['data_columns'].includes(index)) {
                    line.push(value);
                }
                if (viewRest['target_columns'].includes(index)) {
                    yline.push(value);
                }
            });
            xColumnData.push(line);
            yColumnData.push(yline);
        });
        //fill header array with headers of view columns
        this.headers.forEach(function (head, index) {
            if (viewRest['data_columns'].includes(index)) {
                xHeaders.push(head);
            }
            if (viewRest['target_columns'].includes(index)) {
                yHeaders.push(head);
            }
        });
        this.viewRest = viewRest;
        this.createViewMode = false;
        this.saveViewMode = true;
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

    readFile(blob: Blob, isView: boolean): void {
        let reader: FileReader = new FileReader();
        reader.readAsText(blob);
        reader.onload = (e) => {
            let csv: string = reader.result as string;
            var typeOfSeparator = "comma";
            var allTextLines = csv.split(/\r\n|\n/);
            var headers = allTextLines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (headers.length == 1) {
                typeOfSeparator = "semicolon";
                var headers = allTextLines[0].split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            }
            this.headers = headers;
            var lines = [];

            //all data lines
            //for (var i = 0; i < allTextLines.length; i++) {
            //100 data lines
            for (var i = 0; i < 100; i++) {
                // if file has less than 100 lines
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
                this.setupViewMode(this.viewRest);
            }
        }
        this.stopLoading();
    }

    onEdit() {
        this.createViewMode = true;
        this.saveViewMode = false;
    }

    createViewLevel = "";

    //for carousel
    changeCreateViewLevel(level): void {
        switch (level) {
            case "enterViewname":
                this.createViewLevel = "enterViewname";
                break;
            case "selectXColumns":
                this.createViewLevel = "selectXColumns";
                this.yCheckbox = true;
                break;
            case "selectYColumns":
                this.createViewLevel = "selectYColumns";
                this.yCheckbox = false;
                break;
            case "checkAndSave":
                this.createViewLevel = "checkAndSave";
                break;
        }
    }

}
