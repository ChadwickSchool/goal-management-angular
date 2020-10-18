import { DocumentReference } from '@angular/fire/firestore';
import { Class } from './class.model';
import { Group } from './group.model';

export interface User {
    uid: string;
    name: string;
    email: string;
    isAdmin: boolean;
    classes: Array<DocumentReference>;
    goalsAssigned: Array<DocumentReference>;
    goalsCompleted: Array<DocumentReference>;
}