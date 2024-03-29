import { DocumentReference } from '@angular/fire/firestore';
import { Class } from './class.model';

export interface User {
    name: string;
    email: string;
    accountType: string;
    classes: Array<DocumentReference>;
    goalsAssigned: Array<DocumentReference>;
    goalsCompleted: Array<DocumentReference>;
}
