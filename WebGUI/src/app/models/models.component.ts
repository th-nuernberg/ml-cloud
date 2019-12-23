import {
    Component,
    OnInit
} from '@angular/core';
import {
    RestService
} from '../rest.service';
import {
    Inject
} from '@angular/core';
import {
    DOCUMENT
} from '@angular/common';
import {
    ModalService
} from '../modal';

@Component({
    selector: 'app-models',
    templateUrl: './models.component.html',
    styleUrls: ['./models.component.css']
})
export class ModelsComponent implements OnInit {
    //REST
    archs: string[];
    archConfigs: string[];
    parameters: string[];
    parameterDefaults: {} = {};
    parameterValues: string[];
    editMode: boolean;
    archConfigID: string;
    archMode: boolean;
    configMode: boolean;
    arch: string[];
    archConfig: string[];
    archConfigArchDesc: string;
    newConfigName: string;

    constructor(private rest: RestService, @Inject(DOCUMENT) private docu, private modalService: ModalService) {}

    ngOnInit() {
        localStorage.clear();
        this.rest.getAll('architectures').subscribe((resp: string[]) => {
            this.archs = resp;
        });

        this.rest.getAll('architecture_configs').subscribe((resp: string[]) => {
            this.archConfigs = resp;
        });
    }

    openModal(id: string, dsID: string, name: string, expID: string) {
        this.modalService.open(id, dsID, name, expID);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    onArchitectureSelect(id: string): void {
        this.editMode = false;
        this.rest.getType('architectures', id).subscribe((resp: string[]) => {
            this.arch = resp;
            this.parameters = this.arch['parameters'];
            for (let key in this.parameters) {
                this.parameterDefaults[key] = this.parameters[key]['default'];
            }
            // swich mode after parameters loaded
            this.archMode = true;
            this.configMode = false;
        });
    }

    onModelSelect(id: string): void {
        this.rest.getType('architecture_configs', id).subscribe((resp: string[]) => {
            this.archConfig = resp;
            this.parameterValues = this.archConfig['parameters'];
            let archID = this.archConfig['architecture_id'];
            this.rest.getType('architectures', archID).subscribe((resp: string[]) => {
                this.archConfigArchDesc = resp['desc'];
                this.parameters = resp['parameters'];
                // swich mode after parameters loaded
                this.archMode = false;
                this.configMode = true;
            });
        });
    }

    saveNewConfig(): void {
        let paramValues = {};
        for (let key in this.parameters) {
            let val = JSON.parse(this.docu.getElementById(key).value);
            paramValues[key] = val;
        }

        let archConfig = {
            "architecture_id": this.arch['internal_name'],
            "parameters": paramValues,
            "architecture_config_name": this.newConfigName,
            "has_trained_model": false
        };

        this.rest.postType('architecture_configs', archConfig).subscribe((resp: string[]) => {
            this.archConfig = resp;
            this.parameterValues = this.archConfig['parameters'];
            let archID = this.archConfig['architecture_id'];
            this.rest.getType('architectures', archID).subscribe((resp: string[]) => {
                this.parameters = resp['parameters'];
            });
            // update architecture_configs
            this.rest.getAll('architecture_configs').subscribe((resp: string[]) => {
                this.archConfigs = resp;
                this.archMode = false;
                this.configMode = true;
                this.newConfigName = "";
            });
        });
    }

    onEdit() {
        this.editMode = true;
    }

    onSaveChanges() {
        this.editMode = false;
        let paramValues = {};
        for (let key in this.parameters) {
            let val = JSON.parse(this.docu.getElementById(key).value);
            paramValues[key] = val;
        }

        let archConfig = [{
            "op": "replace",
            "path": "/architecture_config_name",
            "value": this.archConfig['architecture_config_name']
                }, {
            "op": "replace",
            "path": "/parameters",
            "value": paramValues
                }];

        this.rest.patchType('architecture_configs', this.archConfig['architecture_config_id'], archConfig).subscribe((resp: string[]) => {
            this.parameterValues = resp['parameters'];
            let archID = resp['architecture_id'];
            this.rest.getType('architectures', archID).subscribe((resp: string[]) => {
                this.parameters = resp['parameters'];
            });
            // update architecture_configs
            this.rest.getAll('architecture_configs').subscribe((resp: string[]) => {
                this.archConfigs = resp;
            });
        });
    }

    onCancel() {
        this.onModelSelect(this.archConfig['architecture_config_id']);
        this.editMode = false;
    }

    onDeleteConfig(id: string) {
        this.rest.deleteType('architecture_configs', id).subscribe((resp: string[]) => {
            this.rest.getAll('architecture_configs').subscribe((resp: string[]) => {
                // update
                this.archConfigs = resp;
                this.editMode = false;
                this.configMode = false;
                this.archMode = false;
            });
        });
    }

}
