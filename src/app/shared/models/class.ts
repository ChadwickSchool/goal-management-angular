import { Class } from './class.model';
import { User } from './user.model';
import { DocumentReference } from '@angular/fire/firestore';

export default class ClassClass implements Class {
  title: string;
  teacherUID: string;
  students: string[];
  id: string;
  goals: DocumentReference[];
  classIcon: string;

  constructor(
    title: string,
    teacherUID: string,
    students: string[],
    id: string,
    goals: DocumentReference[],
    classIcon: string
    ) {
      this.title = title;
      this.teacherUID = teacherUID;
      this.students = students;
      this.id = id;
      this.goals = goals;
      this.classIcon = classIcon;
    }
}
