import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  CollectionReference,
  DocumentReference,
} from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { StudentData } from 'src/app/teacher/class/class.component';
import ClassClass from '../models/class';
import { Class } from '../models/class.model';
import DirectorClassClass from '../models/directorClass';
import { DirectorClass } from '../models/directorClass.model';
import UserClass from '../models/user';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DirectorService {
  private userCollection: CollectionReference;
  private classCollection: CollectionReference;

  constructor(private afs: AngularFirestore) {
    this.userCollection = afs.firestore.collection('users');
    this.classCollection = afs.firestore.collection('classes');
  }

  async assignStudentToClass(classID: string, studentData: any): Promise<any>{
    let promise = this.userCollection.where("email", "==", studentData.email).get().then((docSnapshot) => {
      if(docSnapshot.empty){
        // create student data
        let dataToAdd = {
          ...studentData,
          uid: this.userCollection.doc().id,
          goalsAssigned: [],
          goalsCompleted: [],
          classes: [classID],
          isAdmin: false
        }
        this.userCollection.add(dataToAdd);
        return dataToAdd.uid;
      }else{
        // update student data
        this.userCollection.doc(studentData.id).update({
          classes: firebase.firestore.FieldValue.arrayUnion(this.classCollection.doc(classID))
        })
        return null;
      }
    });
    return promise;
  }
  
  async createStudentForClass(classId: string, studentData: any): Promise<any>{
    // create student data if necessary
    // add student uid to class 
    let promise = new Promise(async(resolve, reject) => {
      let result = await this.assignStudentToClass(classId, studentData).catch((err) => reject(err));
      if(!result){
        this.classCollection.doc(classId).update({
          students: firebase.firestore.FieldValue.arrayUnion(this.userCollection.doc(studentData.id))
        })
        resolve(studentData);
      }else{
        this.classCollection.doc(classId).update({
          students: firebase.firestore.FieldValue.arrayUnion(this.userCollection.doc(result))
        })
        studentData.id = result;
        resolve(studentData);
      }

    });
    
    return promise;
  }
}