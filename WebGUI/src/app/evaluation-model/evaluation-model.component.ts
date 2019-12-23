import {
    Component,
    OnInit
} from '@angular/core';
import {
    RestService
} from '../rest.service';
import {
    ActivatedRoute
} from '@angular/router';

@Component({
    selector: 'app-evaluation-model',
    templateUrl: './evaluation-model.component.html',
    styleUrls: ['./evaluation-model.component.css']
})
export class EvaluationModelComponent implements OnInit {

    public parentModel: boolean = true;
    archConfigs: string[];
    archConfig: string[];
    selectedName: string;
    selectedArchConfigId: string;
    archConfigArch: string[];
    parameterValues: string[];
    datasetName: string;
    viewString: string;

    constructor(private rest: RestService, private route: ActivatedRoute) {}

    ngOnInit() {
        if (localStorage.getItem('training')) {
            localStorage.clear();
        }
        localStorage.setItem('evaluation', 'true');
        let expLocalID = localStorage.getItem('experimentID');
        if (!expLocalID) {
            this.route.queryParams.subscribe(params => {
                let expID = params.exp;
                if (expID) {
                    localStorage.setItem('experimentID', expID);
                }
            });
        };

        this.rest.getAll('architecture_configs').subscribe((resp: string[]) => {
            let archConfigsTemp = resp;
            let modelConfigs = [];
            for (let config of archConfigsTemp) {
                if (config['has_trained_model']) {
                    modelConfigs.push(config);
                }
            }
            this.archConfigs = modelConfigs;
        });
    }

    onClickModel(id: string) {
        this.selectedArchConfigId = id;
        this.rest.getType('architecture_configs', this.selectedArchConfigId).subscribe((resp: string[]) => {
            this.archConfig = resp;
            this.selectedName = this.archConfig['architecture_config_name'];
            let viewID = this.archConfig['view_id'];
            localStorage.setItem('modelViewID', viewID);

            // get architecture
            this.rest.getType('architectures', this.archConfig['architecture_id']).subscribe((resp: string[]) => {
                this.archConfigArch = resp;
            });

        });
        // save ID
        localStorage.setItem('archConfigID', this.selectedArchConfigId);
    }

}
