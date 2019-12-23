import {
    Component,
    OnInit
} from '@angular/core';
import {
    RestService
} from '../rest.service';

@Component({
    selector: 'app-training-architecture',
    templateUrl: './training-architecture.component.html',
    styleUrls: ['./training-architecture.component.css']
})
export class TrainingArchitectureComponent implements OnInit {

    public parentArchitecture: boolean = true;
    archs: string[];
    archConfigs: string[];
    selectedArchId: string;
    selectedArchConfigId: string;
    selectedName: string;
    arch: string[];
    archConfig: string[];
    archConfigArch: string[];

    constructor(private rest: RestService) {}

    ngOnInit() {
        let archLocalID = localStorage.getItem('archID');
        let archConfigLocalID = localStorage.getItem('archConfigID');
        if (archLocalID) {
            // if arch was selected before
            this.selectedName = archLocalID;
            this.selectedArchId = archLocalID;
            this.onClickArch(this.selectedArchId);
        } else if (archConfigLocalID) {
            // else if archConfig was selected before
            this.rest.getType('architecture_configs', archConfigLocalID).subscribe((resp: string[]) => {
                this.selectedName = resp['architecture_config_name'];
                this.selectedArchConfigId = archConfigLocalID;
                this.onClickArchConfig(this.selectedArchConfigId);
            });
        }

        this.rest.getAll('architectures').subscribe((resp: string[]) => {
            this.archs = resp;
        });

        this.rest.getAll('architecture_configs').subscribe((resp: string[]) => {
            this.archConfigs = resp;
        });

    }

    onClickArch(id: string) {
        this.selectedArchId = id;
        this.archConfig = null;
        this.archConfigArch = null;
        this.rest.getType('architectures', this.selectedArchId).subscribe((resp: string[]) => {
            this.arch = resp;
            this.selectedName = this.arch['internal_name']
        });
        // remove archConfigID because arch selected
        localStorage.removeItem('archConfigID');
        // save ID
        localStorage.setItem('archID', this.selectedArchId);
    }

    onClickArchConfig(id: string) {
        this.selectedArchConfigId = id;
        this.arch = null;
        this.rest.getType('architecture_configs', this.selectedArchConfigId).subscribe((resp: string[]) => {
            this.archConfig = resp;
            this.selectedName = this.archConfig['architecture_config_name']
            this.rest.getType('architectures', this.archConfig['architecture_id']).subscribe((resp: string[]) => {
                this.archConfigArch = resp;
            });
        });
        // remove archID because archConfig selected
        localStorage.removeItem('archID');
        // save ID
        localStorage.setItem('archConfigID', this.selectedArchConfigId);
    }

}
