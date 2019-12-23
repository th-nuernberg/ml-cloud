import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
    private modals: any[] = [];

objectID = "";
name = "";
expID = "";

    add(modal: any) {
        // add modal to array of active modals
        this.modals.push(modal);
    }

    remove(id: string) {
        // remove modal from array of active modals
        this.modals = this.modals.filter(x => x.id !== id);
    }

    open(id: string , objectID: string, name:string , expID: string) {
        // open modal specified by id
        this.objectID = objectID;
        this.name = name;
        this.expID = expID;
        const modal = this.modals.find(x => x.id === id);
        modal.open(objectID);
    }

    close(id: string) {
        // close modal specified by id
        const modal = this.modals.find(x => x.id === id);
        modal.close();
    }
}