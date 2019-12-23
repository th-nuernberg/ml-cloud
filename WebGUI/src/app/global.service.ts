import {
    Injectable,
    Directive
} from '@angular/core';

//{providedIn: 'root'}
@Injectable()
export class GlobalService {
    private datasetID;

    constructor() {}

    setDatasetID(val) {
        this.datasetID = val;
    }
    getDatasetID() {
        return this.datasetID;
    }
}
