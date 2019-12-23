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
import {
    interval
} from "rxjs/internal/observable/interval";
import 'rxjs/Rx';
import {
    Observable
} from 'rxjs/Observable';

@Component({
    selector: 'app-dashboard1',
    templateUrl: './dashboard1.component.html',
    styleUrls: ['./dashboard1.component.css']
})
export class Dashboard1Component implements OnInit {

    jobs: string[];
    experiments: string[];
    obs: Observable < any > ;
    subscriber;

    constructor(private rest: RestService, private modalService: ModalService) {}

    ngOnInit() {

        this.rest.getAll('experiments').subscribe((resp: string[]) => {
            this.experiments = resp;
        });

        this.rest.getAll('jobs').subscribe((resp: string[]) => {
            this.jobs = resp;
        });

        // polling jobs
        this.obs = Observable
            .timer(0, 500)
            .switchMap(() => this.rest.getAll('jobs'))


        this.subscriber = this.obs.subscribe((resp: string[]) => {
            if (JSON.stringify(this.jobs) != JSON.stringify(resp)) {
                this.jobs = resp;
            }
        });

    }

    ngOnDestroy() {
        this.subscriber.unsubscribe();
    }

    openModal(id: string, objectID: string, name: string, expID: string) {
        this.modalService.open(id, objectID, name, expID);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    onDeleteJob(expID: string, jobID: string) {
        // delete job
        this.rest.deleteType('jobs', jobID).subscribe((resp: string[]) => {
            // remove jobID from experiment
            this.rest.getType('experiments', expID).subscribe((resp: string[]) => {
                // get index
                let expJobIDs = resp['job_ids'];
                let index = expJobIDs.indexOf(jobID);
                let expConfig = [{
                    "op": "remove",
                    "path": "/job_ids/" + index
                    }];
                this.rest.patchType('experiments', expID, expConfig).subscribe((resp: string[]) => {
                    // update jobs
                    this.rest.getAll('jobs').subscribe((resp: string[]) => {
                        this.jobs = resp;
                    });
                });
            });

        });
    }

    onDeleteExperiment(expID: string) {
        this.rest.getType('experiments', expID).subscribe((resp: string[]) => {
            // delete all jobs of experiment
            let expJobIDs = resp['job_ids'];
            if (expJobIDs.length <= 0) {
                this.rest.deleteType('experiments', expID).subscribe((resp: string[]) => {
                    // update jobs
                    this.rest.getAll('jobs').subscribe((resp: string[]) => {
                        this.jobs = resp;
                    });
                    // update experiments
                    this.rest.getAll('experiments').subscribe((resp: string[]) => {
                        this.experiments = resp;
                    });
                });
            } else {
                // delete experiment
                this.rest.deleteType('experiments', expID).subscribe((resp: string[]) => {
                    let count = 1;
                    for (let jobID of expJobIDs) {
                        this.rest.deleteType('jobs', jobID).subscribe((resp: string[]) => {
                            count++;
                            if (count == expJobIDs.length) {
                                // update jobs
                                this.rest.getAll('jobs').subscribe((resp: string[]) => {
                                    this.jobs = resp;
                                });
                                // update experiments
                                this.rest.getAll('experiments').subscribe((resp: string[]) => {
                                    this.experiments = resp;
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    onDownloadFile(id: string, name: string) {
        this.rest.getEvalCsv(id).subscribe((resp: any) => {
            let dataCsv = resp;
            this.rest.getType('jobs', id).subscribe((resp: string[]) => {
                this.rest.getType('views', resp['view_ids'][0]).subscribe((resp: string[]) => {
                    // get headers
                    let view = resp;
                    let data = view['data_columns'];
                    let label = view['target_columns'];
                    let columnNames = view['column_names'];
                    let viewHeaderString = "";
                    for (let index of data) {
                        viewHeaderString = viewHeaderString + columnNames[index] + ",";
                    }
                    for (let index of label) {
                        viewHeaderString = viewHeaderString + columnNames[index];
                    }
                    dataCsv = viewHeaderString + "\n" + dataCsv;

                    const blob: Blob = new Blob([dataCsv], {
                        type: 'text/csv'
                    });
                    const fileName: string = name;
                    const objectUrl: string = URL.createObjectURL(blob);
                    const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;

                    a.href = objectUrl;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();

                    document.body.removeChild(a);
                    URL.revokeObjectURL(objectUrl);
                });
            });
        });
    }


}
