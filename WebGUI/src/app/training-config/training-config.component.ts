import {
    Component,
    OnInit,
    AfterViewInit
} from '@angular/core';
import {
    HttpClient
} from '@angular/common/http';
import {
    HttpErrorResponse
} from '@angular/common/http';
import {
    RestService
} from '../rest.service';
import {
    Inject
} from '@angular/core';
import {
    DOCUMENT
} from '@angular/common';

@Component({
    selector: 'app-training-config',
    templateUrl: './training-config.component.html',
    styleUrls: ['./training-config.component.css']
})
export class TrainingConfigComponent implements OnInit {

    public parentConfig: boolean = true;
    parameters: string[];
    parameterDefaults: {} = {};
    parameterValues: string[];
    archID: string;
    archConfigID: string;
    archConfigName: string;
    arch: string[];
    archConfig: string[];
    archConfigCopy: string[];
    paramString: string;
    archConfigArchDesc: string;
    createArchConfigMode: boolean;
    saveArchConfigMode: boolean;
    editMode: boolean = false;

    constructor(private rest: RestService, @Inject(DOCUMENT) private docu) {}

    ngOnInit() {
        this.archID = localStorage.getItem('archID');
        this.archConfigID = localStorage.getItem('archConfigID');
        if (this.archID) {
            this.rest.getType('architectures', this.archID).subscribe((resp: string[]) => {
                this.arch = resp;
                this.parameters = this.arch['parameters'];
                for (let key in this.parameters) {
                    this.parameterDefaults[key] = this.parameters[key]['default'];
                }
                this.createArchConfigMode = true;
                this.saveArchConfigMode = false;
            });
        } else if (this.archConfigID) {
            this.rest.getType('architecture_configs', this.archConfigID).subscribe((resp: string[]) => {
                let archConfig = resp;
                if (archConfig['has_trained_model']) {
                    let config = {
                        "architecture_id": archConfig['architecture_id'],
                        "parameters": archConfig['parameters'],
                        "architecture_config_name": archConfig['architecture_config_name'] + " Copy",
                        "has_trained_model": false
                    };
                    // copy
                    this.rest.postType('architecture_configs', config).subscribe((resp: string[]) => {
                        this.archConfig = resp;
                        this.archConfigID = resp['architecture_config_id'];
                        this.setupArchConfigMode(this.archConfig);
                        localStorage.setItem('archConfigID', this.archConfigID);
                    });
                } else {
                    // use as is
                    this.archConfig = archConfig;
                    this.setupArchConfigMode(this.archConfig);
                }
            });
        }

    }

    saveNewArchConfig() {
        let paramValues = {};
        for (let key in this.parameters) {
            let val = JSON.parse(this.docu.getElementById(key).value);
            paramValues[key] = val;
        };

        let archConfig = {
            "architecture_id": this.archID,
            "parameters": paramValues,
            "architecture_config_name": this.archConfigName,
            "has_trained_model": false
        };

        this.rest.postType('architecture_configs', archConfig).subscribe((resp: string[]) => {
            let archConfig = resp;
            this.archConfigID = archConfig['architecture_config_id'];
            this.paramString = "";
            for (let key in this.parameters) {
                let val = this.docu.getElementById(key).value;
                this.paramString = this.paramString + " " + key + ": " + val + "; ";
            }
            this.setupArchConfigMode(archConfig);
            localStorage.removeItem('archID');
            localStorage.setItem('archConfigID', this.archConfigID);
        });

    }

    setupArchConfigMode(archConfig: string[]) {
        this.parameterValues = archConfig['parameters'];
        // create paramString for selected parameter display
        this.paramString = "";
        for (let key in this.parameterValues) {
            let val = this.parameterValues[key];
            this.paramString = this.paramString + " " + key + ": " + val + "; ";
        }
        this.archConfigName = archConfig['architecture_config_name'];
        // parameterDefaults for parameter labels
        this.parameterDefaults = {};
        for (let key in this.parameters) {
            this.parameterDefaults[key] = this.parameters[key]['default'];
        }
        // get parameters of the architeture from config for boundaries and default values
        this.archID = archConfig['architecture_id'];
        this.rest.getType('architectures', this.archID).subscribe((resp: string[]) => {
            this.archConfigArchDesc = resp['desc'];
            this.parameters = resp['parameters'];
        });
        this.archConfig = archConfig;
        this.createArchConfigMode = false;
        this.saveArchConfigMode = true;
    }

    onEdit() {
        this.archConfigCopy = JSON.parse(JSON.stringify(this.archConfig));
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
                this.paramString = "";
                for (let key in this.parameters) {
                    let val = this.docu.getElementById(key).value;
                    this.paramString = this.paramString + " " + key + ": " + val + "; ";
                }
            });
        });
    }

    onCancel() {
        this.setupArchConfigMode(this.archConfigCopy);
        this.editMode = false;
    }

}
