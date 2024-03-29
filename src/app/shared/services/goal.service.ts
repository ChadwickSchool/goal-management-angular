import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
  DocumentReference,
} from '@angular/fire/firestore';
import * as firebase from 'firebase';
import {
  GoalsTableData,
  GoalStat,
} from 'src/app/teacher/class/class.component';
import { Goal } from '../models/goal.model';
import GoalClass from 'src/app/shared/models/goal';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { User } from '../models/user.model';
import FileClass from '../models/file';
import { File } from '../models/file.model';
import { AngularFireStorage } from '@angular/fire/storage';
import LinkClass from '../models/link';
import NoteClass from '../models/note';
import { Commit } from '../models/commit.model';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  goalsCollection: CollectionReference;
  usersCollection: CollectionReference;
  filesCollection: CollectionReference;

  // initializing collections
  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.goalsCollection = this.afs.firestore.collection('goals');
    this.usersCollection = this.afs.firestore.collection('users');
    this.filesCollection = this.afs.firestore.collection('files');
  }

  // get goals for class supplied with classID
  // @params classID: string
  getGoalsForClass(classID: string): Promise<any> {
    const goals: Goal[] = [];
    const promise = this.goalsCollection
      .where('classID', '==', classID)
      .orderBy('dueDate', 'desc')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          goals.push(
            new GoalClass(
              doc.data().teacherEmail,
              doc.data().description,
              doc.data().dueDate,
              doc.data().classID,
              doc.data().hasCompleted,
              doc.data().pending,
              doc.data().declined,
              doc.id,
              doc.data().createdBy,
              doc.data().assignedToID,
              doc.data().declinedMessages,
              doc.data().files,
              doc.data().links
            )
          );
        });
        return goals;
      });
    return promise;
  }

  // get individual goals for class supplied with classID and userID
  // @params classID: string, userID: string
  getGoalsForClassWithId(classID: string, userID: string): Promise<any> {
    const goals: Goal[] = [];
    const promise = this.goalsCollection
      .where('classID', '==', classID)
      .where('assignedToID', 'array-contains', userID)
      .orderBy('dueDate', 'desc')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const newGoal = new GoalClass(
            doc.data().teacherEmail,
            doc.data().description,
            doc.data().dueDate,
            doc.data().classID,
            doc.data().hasCompleted,
            doc.data().pending,
            doc.data().declined,
            doc.id,
            doc.data().createdBy,
            doc.data().assignedToID,
            doc.data().declinedMessages,
            doc.data().files,
            doc.data().links,
            doc.data().commits
          );
          goals.push(newGoal);
        });
        return goals;
      });
    return promise;
  }

  // get individual goal supplied with goalID
  // @params goalID: string
  getGoalById(goalID: string): Promise<any> {
    const promise = this.goalsCollection
      .doc(goalID)
      .get()
      .then((doc) => doc.data())
      .catch((err) => {
        console.log(err);
      });
    return promise;
  }

  // get goal by an array of goalIDs and the user's id
  // @params goalIDs: DocumentReference[], uid: string
  async getGoalsById(goalIDs: DocumentReference[], uid: string): Promise<any> {
    const goals: GoalsTableData[] = [];
    for (const goal of goalIDs) {
      const doc = await this.goalsCollection.doc(goal.id).get();
      const goalRef = new GoalClass(
        doc.data().teacherEmail,
        doc.data().description,
        doc.data().dueDate,
        doc.data().classID,
        doc.data().hasCompleted,
        doc.data().pending,
        doc.data().declined,
        doc.id,
        doc.data().createdBy,
        doc.data().assignedToID,
        doc.data().declinedMessages,
        doc.data().files,
        doc.data().links,
        doc.data().commits
      );

      const status = this.getUserStatus(
        goalRef.hasCompleted,
        goalRef.pending,
        goalRef.declined,
        uid
      );
      if (status !== 'declined') {
        goals.push({
          description: goalRef.description,
          dueDate: goalRef.dueDate,
          isCompleted: this.userHasCompleted(goalRef.hasCompleted, uid),
          createdBy: goalRef.createdBy.name,
          goalReference: goalRef,
          status,
        });
      }
    }
    return goals;
  }

  // get goal by document reference
  // @params doc: DocumentReference
  getGoalByReference(doc: DocumentReference): Promise<any> {
    const promise = doc.get().then((paper) => {
      return {...paper.data(), id: paper.id};
    });
    return promise;
  }

  // get a user's status of a goal
  // @params completedUsersID: string[], pendingUsersID: string[], declinedUsersID: string[], userID: string
  getUserStatus(
    completedUsersID: string[],
    pendingUsersID: string[],
    declinedUsersID: string[],
    userID: string
  ) {
    if (completedUsersID != null) {
      if (completedUsersID.includes(userID)) {
        return 'completed';
      }
    }

    if (declinedUsersID != null) {
      if (declinedUsersID.includes(userID)) {
        return 'declined';
      }
    }

    if (pendingUsersID != null) {
      if (pendingUsersID.includes(userID)) {
        return 'pending';
      }
    }

    return 'incomplete';
  }

  // check if the user has completed a goal
  // @params completedUsersID: string[], userID: string
  userHasCompleted(completedUsersID: string[], userID: string) {
    if (completedUsersID == null) {
      return false;
    }
    if (completedUsersID.includes(userID)) {
      return true;
    } else {
      return false;
    }
  }

  // assign a goal to one student
  // @params goal: Goal, uid: string
  assignGoal(goal: Goal, uid: string): Promise<any> {
    const promise = this.afs
      .doc<Goal>(`goals/` + goal.id)
      .set(goal)
      .then(() => {
        this.afs.firestore
          .collection('users')
          .doc(uid)
          .update({
            goalsAssigned: firebase.firestore.FieldValue.arrayUnion(goal),
          });
      })
      .catch((err) => console.log(err));
    return promise;
  }

  // mark goal as complete
  // @params goal: Goal, uid: string
  completeGoal(goal: Goal, uid: string): Promise<any> {
    goal = this.validateGoal(goal);
    if (goal.hasCompleted == null) {
      goal.hasCompleted = [uid];
    } else {
      goal.hasCompleted.push(uid);
    }

    if (goal.files == null) {
      goal.files = [];
    } else {
      goal.files = goal.files.map((file) => Object.assign({}, file));
    }
    
    if (goal.commits == null) {
      goal.commits = [];
    } else {
      goal.commits = goal.commits.map((commit) => Object.assign({}, commit));
    }

    const promise = this.afs
      .doc<Goal>(`goals/` + goal.id)
      .set({ ...goal })
      .then(() => {
        const ref = this.goalsCollection.doc(goal.id);
        this.afs.firestore
          .collection('users')
          .doc(uid)
          .update({
            goalsCompleted: firebase.firestore.FieldValue.arrayUnion(ref),
          });
      })
      .catch((err) => console.log(err));

    return promise;
  }

  // validate goal by checking its fields
  // @params goal: Goal
  validateGoal(goal: Goal) {
    if (goal.files == null) {
      goal.files = [];
    }

    if (goal.links == null) {
      goal.links = [];
    }

    if (goal.assignedToID == null) {
      goal.assignedToID = [];
    }

    if (goal.hasCompleted == null) {
      goal.hasCompleted = [];
    }

    if (goal.declined == null) {
      goal.declined = [];
    }

    if (goal.commits == null) {
      goal.commits = [];
    }

    if (goal.declinedMessages == null) {
      goal.declinedMessages = [];
    }

    if (goal.pending == null) {
      goal.pending = [];
    }

    return goal;
  }

  // unsubmit a goal
  // @params goal: Goal, uid: string
  unsubmitGoal(goal: Goal, uid: string): Promise<any> {
    console.log("inputs", goal, uid)
    goal = this.validateGoal(goal);
    // filters out the inputted goal from the hasCompleted field therefore unsubmitting it
    goal.hasCompleted = goal.hasCompleted.filter((item) => item !== uid);
    const promise = this.afs
      .doc<Goal>(`goals/` + goal.id)
      .set(goal)
      .then(() => {
        const ref = this.goalsCollection.doc(goal.id);
        this.afs.firestore
          .collection('users')
          .doc(uid)
          .update({
            goalsCompleted: firebase.firestore.FieldValue.arrayRemove(ref),
          });
      })
      .catch((err) => console.log(err));

    return promise;
  }

  // assign goal to multiple students
  // @params goalID: string, studentID: string[]
  assignToStudents(goalID: string, studentID: string[]): void {
    const goalRef: DocumentReference = this.goalsCollection.doc(goalID);
    studentID.forEach((id) => {
      this.usersCollection.doc(id).update({
        goalsAssigned: firebase.firestore.FieldValue.arrayUnion(goalRef),
      });
    });
  }

  // upload file to goal and Firebase
  // @params goalID: string, fileData: FileClass
  uploadFile(goalID: string, fileData: FileClass) {
    const goalRef = this.goalsCollection.doc(goalID);
    this.filesCollection.add({ ...fileData }).then((docRef) => {
      goalRef.update({
        files: firebase.firestore.FieldValue.arrayUnion({ ...fileData }),
      });
    });
  }

  // update status of goal (missing, complete, uncompleted, declined)
  // @params goalID: string, status: string, uid: string, rejectionNote?: string
  updateGoalStatus(
    goalID: string,
    status: string,
    email: string,
    rejectionNote?: string
  ): Promise<any> {
    const goalRef = this.goalsCollection.doc(goalID);
    let promise: Promise<any>;
    if (status === 'incomplete') {
      // if status is incomplete the user has accepted the goal
      promise = goalRef.update({
        pending: firebase.firestore.FieldValue.arrayRemove(email),
      });
    }

    if (status === 'declined') {
      // adds user to declined field of goal if the goal is marked as declined
      promise = goalRef
        .update({ declined: firebase.firestore.FieldValue.arrayUnion(email) })
        .then(() => {
          goalRef.update({
            pending: firebase.firestore.FieldValue.arrayRemove(email),
          });
          const rejectNote: NoteClass = { email, note: rejectionNote };
          this.goalsCollection.doc(goalID).update({
            declinedMessages: firebase.firestore.FieldValue.arrayUnion({
              ...rejectNote,
            }),
          });
        });
    }

    if (status === 'completed') {
      promise = goalRef.update({
        hasCompleted: firebase.firestore.FieldValue.arrayUnion(email),
      });
    }

    return promise;
  }

  // create a goal
  // @params goal: GoalClass
  createGoal(goal: GoalClass): Promise<any> {
    const goalData = this.validateGoal(goal);
    const promise = this.goalsCollection
      .add({ ...goalData })
      .then((docRef) => {
        this.assignToStudents(docRef.id, goal.assignedToID);
        return;
      })
      .catch((err) => console.log(err));
    return promise;
  }

  // delete specific goal
  // @params goalData: GoalClass
  deleteGoal(goalData: GoalClass): Promise<any> {
    // remove goal from student assignedGoals field
    const goalRef = this.goalsCollection.doc(goalData.id);
    goalData.assignedToID.forEach((studentID) => {
      this.usersCollection.doc(studentID).update({
        goalsAssigned: firebase.firestore.FieldValue.arrayRemove(goalRef),
      });
    });
    // remove goal from student goalsCompleted field
    goalData.hasCompleted.forEach((studentID) => {
      this.usersCollection.doc(studentID).update({
        goalsCompleted: firebase.firestore.FieldValue.arrayRemove(goalRef),
      });
    });

    // if goal has files then delete them from the database one at a time
    if (goalData.files != null) {
      goalData.files.forEach((file) => {
        this.filesCollection
          .where('downloadURL', '==', file.downloadURL)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              this.filesCollection.doc(doc.id).delete();
              this.storage.ref(file.path).delete();
            });
          });
      });
    }

    // remove doc from goal collection
    const promise = goalRef
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => console.log(err));
    return promise;
  }

  // get file from database
  // @params fileDownloadURL: string
  getFileID(fileDownloadURL: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.filesCollection
        .where('downloadURL', '==', fileDownloadURL)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log('got the document id: ', doc.id);
            resolve(doc.id);
          });
        });
    });
  }

  // delete link from goal
  // @params newLinks: LinkClass[], goalID: string
  removeLinks(newLinks: LinkClass[], goalID: string): Promise<any> {
    const promise = this.goalsCollection
      .doc(goalID)
      .update({ links: newLinks })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });
    return promise;
  }

  // delete file from goal
  // @params file: FileClass, goalID: string
  async deleteFileFromGoal(file: FileClass, goalID: string): Promise<any> {
    const fileID = await this.getFileID(file.downloadURL);
    // delete from goal
    const promise = this.goalsCollection
      .doc(goalID)
      .update({ files: firebase.firestore.FieldValue.arrayRemove({ ...file }) })
      .then(() => {
        // delete from storage
        this.storage.ref(file.path).delete();
        // delete from collection
        this.filesCollection
          .doc(fileID)
          .delete()
          .then(() => {
            return;
          })
          .catch((err) => console.log(err));
      });
    return promise;
  }

  // add a link to goal given goalID and link
  // @params goalID: string, link: LinkClass
  addLinkToGoal(goalID: string, link: LinkClass): Promise<any> {
    const promise = this.goalsCollection
      .doc(goalID)
      .update({ links: firebase.firestore.FieldValue.arrayUnion(link) })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });
    return promise;
  }

  // add a link to goal given goalID and link
  // @params goalID: string, github commit link: string
  addCommitToGoal(goalID: string, commit: Commit): Promise<any> {
    const promise = this.goalsCollection
      .doc(goalID)
      .update({ commits: firebase.firestore.FieldValue.arrayUnion(Object.assign({}, commit)) })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });
    return promise;
  }

  // update goal given new goal object and original goal
  // @params goal: GoalClass, prevGoal: GoalClass
  editGoal(goal: GoalClass, prevGoal: GoalClass): Promise<any> {
    const goalData = this.validateGoal(goal);
    const promise = this.goalsCollection
      .doc(goal.id)
      .set({ ...goalData })
      .catch((err) => console.log(err));
    return promise;
  }
}
