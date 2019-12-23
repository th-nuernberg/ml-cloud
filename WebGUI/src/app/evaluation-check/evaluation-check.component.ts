import {
    Component,
    OnInit
} from '@angular/core';
import {
    RestService
} from '../rest.service';
import {
    Router
} from '@angular/router';

@Component({
    selector: 'app-evaluation-check',
    templateUrl: './evaluation-check.component.html',
    styleUrls: ['./evaluation-check.component.css']
})
export class EvaluationCheckComponent implements OnInit {

    public parentCheck: boolean = true;
    experiment: string[];
    viewID: string;
    archConfigID: string;
    archConfig: string[];
    datasetName: string;
    viewString: string;
    archID: string;
    archConfigString: string;
    jobName: string;
    experimentName: string;
    experimentID: string;

    constructor(private rest: RestService, private router: Router) {}

    ngOnInit() {

        this.experimentID = localStorage.getItem("experimentID");
        if (this.experimentID) {
            this.rest.getType('experiments', this.experimentID).subscribe((resp: string[]) => {
                this.experimentName = resp['experiment_name'];
            });
        }

        this.viewID = localStorage.getItem("viewID");
        if (this.viewID) {
            this.rest.getType('views', this.viewID).subscribe((resp: string[]) => {
                let view = resp;
                this.viewString = view['view_name'] + ",   Data: " + view['data_columns'] + "   Label: " + view['target_columns'];
                this.rest.getType('datasets', view['dataset_id']).subscribe((resp: string[]) => {
                    this.datasetName = resp['filename'];
                });
            });
        }

        this.archConfigID = localStorage.getItem("archConfigID");
        if (this.archConfigID) {
            this.rest.getType('architecture_configs', this.archConfigID).subscribe((resp: string[]) => {
                let archConfig = resp;
                this.archID = archConfig['architecture_id'];
                this.archConfigString = archConfig['architecture_config_name'] + ",   Parameters: " + JSON.stringify(archConfig['parameters']);
            });
        }

    }

    onSubmit() {
        let viewIDs = [];
        viewIDs.push(this.viewID);
        let jobConfig = {
            "job_name": this.jobName,
            "architecture_config_id": this.archConfigID,
            "view_ids": viewIDs,
            "type": "predict",
            "status": "created",
            "dataset_name": this.datasetName,
            "view_name": this.viewString,
            "architecture_name": this.archID,
            "config_name": this.archConfigString
        };

        this.rest.postType('jobs', jobConfig).subscribe((resp: string[]) => {
            let jobID = resp['job_id'];
            let jobIDs = [];
            jobIDs.push(jobID);

            if (this.experimentID) {
                //update existing experiment
                let experimentConfig = [{
                    "op": "add",
                    "path": "/job_ids/-",
                    "value": jobID
                }];
                this.rest.patchType('experiments', this.experimentID, experimentConfig).subscribe((resp: string[]) => {
                    let experimentID = resp['experiment_id'];
                    this.rest.startJob(jobID).subscribe((resp: string[]) => {
                        localStorage.clear();
                        this.router.navigate(['/dashboard']);
                    });
                });
            } else {
                //create new experiment
                let experimentConfig = {
                    "experiment_name": this.experimentName,
                    "job_ids": jobIDs
                };
                this.rest.postType('experiments', experimentConfig).subscribe((resp: string[]) => {
                    let experimentID = resp['experiment_id'];
                    this.rest.startExperiment(experimentID).subscribe((resp: string[]) => {
                        localStorage.clear();
                        this.router.navigate(['/dashboard']);
                    });
                });
            }

        });
    }

}
