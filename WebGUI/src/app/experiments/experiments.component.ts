import {
    Component,
    OnInit
} from '@angular/core';
import {
    HttpClient
} from '@angular/common/http';
import {
    HttpErrorResponse
} from '@angular/common/http';

@Component({
    selector: 'app-experiments',
    templateUrl: './experiments.component.html',
    styleUrls: ['./experiments.component.css']
})
export class ExperimentsComponent implements OnInit {

    constructor(private httpService: HttpClient) {}
    jobs: string[];
    experiments: string[];

    ngOnInit() {
        this.httpService.get('http://localhost:5000/experiment_configs').subscribe(
            (data) => {
                this.experiments = data as string[]; // FILL THE ARRAY WITH DATA.
                //console.log(this.experiments[1]);
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
            }
        );

        //if (this.experiments.length > 0) {
            //for (let experiment of this.experiments) {
                //experiment.job_ids.forEach((job_id, i) => {
                    //this.httpService.get('http://localhost:5000/job/' + job_id).subscribe(
                        //(data) => {
                            //this.jobs[i] = data as string; // FILL THE ARRAY WITH DATA.
                            //console.log(this.jobs[i]);
                        //},
                        //(err: HttpErrorResponse) => {
                            //console.log(err.message);
                        //}
                    //);
                //});
            //}
        //}
    }
}
