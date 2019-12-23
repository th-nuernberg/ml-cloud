import {
    Component,
    OnInit,
    ElementRef
} from '@angular/core';
import {
    RestService
} from '../rest.service';
import {
    ActivatedRoute
} from '@angular/router';

@Component({
    selector: 'app-training-upload',
    templateUrl: './training-upload.component.html',
    styleUrls: ['./training-upload.component.css']
})

export class TrainingUploadComponent implements OnInit {


    public parentUpload: boolean = true;
    datasets: string[];
    views: string[];
    selectedFile: File;
    //datasetID: string;
    selectedDatasetId: string;
    selectedName: string;
    selectedViewId: string;
    hasHeaders: boolean;
    //selectedViewName: string;

    constructor(private rest: RestService, private route: ActivatedRoute) {}

    ngOnInit() {
        //        let datasetName = localStorage.getItem('datasetName');
        //        let viewName = localStorage.getItem('viewName');
        //        if (datasetName) {
        //            
        //            // if no dataset was selected before
        //            this.selectedDatasetName = "Nothing selected";
        //        } else {
        //            // if dataset was selected before
        //            this.selectedDatasetName = datasetName;
        //        }
        if (localStorage.getItem('evaluation')) {
            localStorage.clear();
        }
        localStorage.setItem('training', 'true');
        let expLocalID = localStorage.getItem('experimentID');
        if (!expLocalID) {
            this.route.queryParams.subscribe(params => {
                let expID = params.exp;
                if (expID) {
                    localStorage.setItem('experimentID', expID);
                }
            });
        }

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
                    //localStorage.setItem('datasetName', this.selectedDatasetName);

                    //focus uploaded Dataset
                    //let datasetElement: HTMLElement = document.getElementById(datasetID) as HTMLElement;
                    //datasetElement.focus();
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
        // save Name
        //localStorage.setItem('datasetName', this.selectedDatasetName);
        // retrieve ID
        //console.log(localStorage.getItem('datasetID'));
    }

    onClickView(event: Event) {
        this.selectedViewId = (event.target as Element).id;
        this.selectedName = (event.target as Element).getAttribute('name');
        // remove datasetID because view selected
        localStorage.removeItem('datasetID');
        // save ID
        localStorage.setItem('viewID', this.selectedViewId);
        // save Name
        //localStorage.setItem('viewName', this.selectedViewName);
        // retrieve ID
        //console.log(localStorage.getItem('datasetID'));
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
