import {
    Component,
    OnInit,
    ElementRef
} from '@angular/core';
import {
    RestService
} from '../rest.service';

@Component({
    selector: 'app-evaluation-data',
    templateUrl: './evaluation-data.component.html',
    styleUrls: ['./evaluation-data.component.css']
})
export class EvaluationDataComponent implements OnInit {

    public parentData: boolean = true;
    datasets: string[];
    views: string[];
    compatibleViews: string[];
    selectedFile: File;
    selectedDatasetId: string;
    selectedName: string;
    selectedViewId: string;
    hasHeaders: boolean;
    modelViewID: string;

    constructor(private rest: RestService) {}

    ngOnInit() {
        let datasetLocalID = localStorage.getItem('datasetID');
        let viewLocalID = localStorage.getItem('viewID');
        if (datasetLocalID) {
            // if dataset was selected before
            this.rest.getType('datasets', datasetLocalID).subscribe((resp: string[]) => {
                this.selectedName = resp['filename'];
            });
        } else if (viewLocalID) {
            // else if view was selected before
            this.rest.getType('views', viewLocalID).subscribe((resp: string[]) => {
                this.selectedName = resp['view_name'];
            });
        }


        // get all datasets to show
        this.rest.getAll('datasets').subscribe((resp: string[]) => {
            this.datasets = resp;
        });

        // get all views to show
        this.rest.getAll('views').subscribe((resp: string[]) => {
            this.views = resp;
        });

        this.modelViewID = localStorage.getItem('modelViewID');
        if (this.modelViewID) {
            this.rest.getCompatibleViews(this.modelViewID).subscribe((resp: string[]) => {
                this.compatibleViews = resp;
            });
        } else {
            this.compatibleViews = [];
        }
    }

    onFileChanged(event) {
        this.selectedFile = event.target.files[0]
    }

    onUpload() {
        if (this.selectedFile) {
            let datasetConfig = {
                "filename": this.selectedFile.name,
                "has_headers": this.hasHeaders
            };
            this.rest.postType('datasets', datasetConfig).subscribe((resp: string[]) => {
                let datasetID = resp['dataset_id'];
                let datasetName = resp['filename'];
                this.rest.putDataset(this.selectedFile, datasetID).subscribe((resp: string[]) => {
                    //update Datasets
                    this.rest.getAll('datasets').subscribe((resp: string[]) => {
                        this.datasets = resp;
                    });

                    // set selection automatically to uploaded file
                    this.selectedDatasetId = datasetID;
                    localStorage.setItem('datasetID', this.selectedDatasetId);
                    this.selectedName = datasetName;

                });
            });
        }
    }

    onClickDataset(event: Event) {
        this.selectedDatasetId = (event.target as Element).id;
        this.selectedName = (event.target as Element).getAttribute('name');
        // remove viewID because dataset selected
        localStorage.removeItem('viewID');
        // save ID
        localStorage.setItem('datasetID', this.selectedDatasetId);
    }

    onClickView(event: Event) {
        this.selectedViewId = (event.target as Element).id;
        this.selectedName = (event.target as Element).getAttribute('name');
        // remove datasetID because view selected
        localStorage.removeItem('datasetID');
        // save ID
        localStorage.setItem('viewID', this.selectedViewId);
    }

    onItemChange(value) {
        switch (value) {
            case "noheaders":
                this.hasHeaders = false;
                break;
            case "hasheaders":
                this.hasHeaders = true;
                break;
        }
    }

}
