import { Component } from '@angular/core';
import { MatDialog, MatPaginator } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Class } from 'src/app/shared/models/class.model';
import { Goal } from 'src/app/shared/models/goal.model';
import { UpdateGoalComponent } from '../../dialogs/update-goal/update-goal.component';
import { EditGoalComponent } from '../../dialogs/edit-goal/edit-goal.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ClassService } from 'src/app/shared/services/class.service';
import { GoalService } from 'src/app/shared/services/goal.service';
import { CreateGoalComponent } from 'src/app/dialogs/create-goal/create-goal.component';
import UserClass from 'src/app/shared/models/user';
import GoalClass from 'src/app/shared/models/goal';
import { DeleteGoalComponent } from 'src/app/dialogs/delete-goal/delete-goal.component';
import { ChangeStatusComponent } from 'src/app/dialogs/change-status/change-status.component';
import { CreateStudentGoalComponent } from 'src/app/dialogs/create-student-goal/create-student-goal.component';
import { GoalStudentDataService } from 'src/app/shared/services/goal-student-data.service';
import { DocumentReference } from '@angular/fire/firestore';
import { WarningPendingComponent } from 'src/app/dialogs/warning-pending/warning-pending.component';
import { ViewTeacherRejectionComponent } from 'src/app/dialogs/view-teacher-rejection/view-teacher-rejection.component';
import { NbDialogService, NbGetters, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';

export interface StudentData {
  name: string;
  id: string;
  goalsAssigned: number;
  goalsCompleted: number
}

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

export interface GoalsTableData {
  description: string;
  dueDate: Date;
  isCompleted: boolean;
  createdBy: string;
  goalReference: Goal;
  status: string;
}

export interface GoalStat {
  description: string;
  teacherEmail: string;
  dueDate: Date;
  assignedToID: Array<string>;
  hasCompleted: Array<string>;
  pending: Array<string>;
  declined: Array<string>;
  id: string;
  createdBy: any;
}

@Component({
  selector: 'gms-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss'],
})
export class ClassComponent {
  source: NbTreeGridDataSource<any>;
  customColumn = 'description';
  defaultColumns = [ 'dueDate', 'isCompleted', 'createdBy' ];
  allColumns = [ this.customColumn, ...this.defaultColumns ];
  displayedColumns: string[] = ['name', 'goalsAssigned', 'goalsCompleted'];
  goalsDisplayedColumns: string[] = [
    'description',
    'dueDate',
    'isCompleted',
    'createdBy',
  ];

  data: TreeNode<any>[] = [
  ];

  classgoalsDisplayedColumns: string[] = [
    'description',
    'dueDate',
    'assignedTo',
    'completed',
    'edit',
  ];
  goalsDataSource: GoalsTableData[] = [];
  classGoals: GoalStat[] = [];
  class: Class;
  accountType: string;
  loading = true;
  email: string;
  user: UserClass;
  classID: string;
  studentSource: StudentData[];
  studentDataSource: StudentData[] = [];

  constructor(
    private route: ActivatedRoute,
    private classService: ClassService,
    private auth: AuthService,
    public dialog: MatDialog,
    private goalService: GoalService,
    private router: Router,
    private studentsGoalService: GoalStudentDataService,
    private dialogService: NbDialogService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>
  ) {
    this.auth.user$.subscribe(async (userProfile) => {
      this.loading = true;
      this.classID = this.route.snapshot.paramMap.get('classID');
      if (!userProfile) {
        return;
      }
      this.source = dataSourceBuilder.create(this.data);
      this.getClass(this.classID, userProfile.email).then(() => {
        this.user = userProfile;
        this.accountType = userProfile.accountType;
        this.email = userProfile.email;
        if (this.accountType === 'student') {
          this.getGoalsForStudent(this.classID, userProfile.email);
          this.loading = false;
        } else if (this.accountType === 'teacher') {
          this.getStudentData();
          this.getAllGoalsForTeacher(this.classID);
          this.loading = false;
        }
      });
    });
  }

  getStudentData() {
    // work on this
    this.classService
      .getStudentsDataByReferenceClassID(this.class.students, this.classID)
      .then((studentData) => {
        console.log('retrieved student data', studentData);
        this.studentDataSource = studentData;
      });
  }

  private formatGoals(goals:any): any[]{
    let result = []
    goals.forEach((goal) => {
      result.push({
        data: goal
      })
    });
    return result;
  }

  openStudentData(studentID: string) {
    this.router.navigate([`/classes/${this.classID}/students/${studentID}`]);
  }

  openGoalData(goal: GoalStat) {
    //pending check
    console.log("pending", goal);
    console.log(this.getLengthOf(goal.pending), this.getLengthOf(goal.assignedToID), this.studentCreatedClass(goal));

    if(this.getLengthOf(goal.pending) == 1 && this.getLengthOf(goal.assignedToID) == 1 && this.studentCreatedClass(goal)){
      let dialogRef = this.dialogService.open(ChangeStatusComponent, {
        context: {data: {...goal, uid: goal.assignedToID[0], email: goal.assignedToID[0]}}
      });

      dialogRef.onClose.subscribe((result) => {
        if (result === 'updated') {
          // if the goal is successfully deleted, reshow goals
          this.getAllGoalsForTeacher(this.classID);
        }
      });
    }else{
      this.studentsGoalService.setStudentGoalData(null, null);
      this.router.navigate([`/classes/${this.classID}/goals/${goal.id}`]);
    }
  }

  async getAssignmentCount(studentAssignments: DocumentReference[]): Promise<number>{
    let count = 0;
    
    return count;
  }

  goalIsCompleted(hasCompleted: string[], userID: string) {
    console.log(
      'goalIsCompleted?',
      this.goalService.userHasCompleted(hasCompleted, userID)
    );
    return this.goalService.userHasCompleted(hasCompleted, userID);
  }

  getClass(id: string, teacherEmail: string): Promise<any> {
    const promise = this.classService.getClass(teacherEmail, id).then((data) => {
      this.class = data;
    });
    return promise;
  }

  getAllGoalsForTeacher(classID: string) {
    this.loading = true;
    const goals: GoalStat[] = [];
    this.goalService.getGoalsForClass(classID).then((data) => {
      data.forEach((element) => {
        const newGoal: GoalStat = {
          teacherEmail: element.teacherEmail,
          description: element.description,
          dueDate: element.dueDate,
          pending: element.pending,
          declined: element.declined,
          hasCompleted: element.hasCompleted,
          assignedToID: element.assignedToID,
          createdBy: element.createdBy,
          id: element.id,
        };
        goals.push(newGoal);
      });
      this.classGoals = goals;
      this.data = this.formatGoals(data)
      this.source = this.dataSourceBuilder.create(this.data);
      console.log('class goals', this.source);
    });
    this.loading = false;
  }

  getLengthOf(array: any[]) {
    if (array == null) {
      return 0;
    }
    return array.length;
  }

  studentCreatedClass(goal: GoalStat): boolean{
    if(this.getLengthOf(goal.assignedToID) == 1 && (goal.createdBy.email == goal.assignedToID[0])){
      return true;
    }
    return false;
  }

  getGoalsForStudent(classID: string, email: string) {
    this.loading = true;
    const goals: GoalsTableData[] = [];
    // get goals for class and loop through each
    this.goalService.getGoalsForClassWithId(classID, email).then((data) => {
      data.forEach((element) => {
        const status = this.goalService.getUserStatus(
          element.hasCompleted,
          element.pending,
          element.declined,
          email
        );
        const newGoal: GoalsTableData = {
          // intializes goal object to display on table
          description: element.description,
          dueDate: element.dueDate,
          isCompleted: this.goalIsCompleted(element.hasCompleted, email),
          createdBy: element.createdBy,
          goalReference: element,
          status,
        };
          goals.push(newGoal);
      });
      this.goalsDataSource = goals;
      this.data = this.formatGoals(goals)
      this.source = this.dataSourceBuilder.create(this.data);
      console.log('class goals', this.data);
    });
    this.loading = false;
  }

  openDialog(data: any, userEmail: string, isCompleted: boolean, status: string) {
    data.email = userEmail;
    data.isCompleted = isCompleted;
    
    let dialogRef;
    console.log("sending data", data);

    if(status == "pending" && this.studentCreatedClass(data)){
      console.log("open pending");
      dialogRef = this.dialogService.open(WarningPendingComponent)
   } else if (status === 'pending') {
      // if the goal status is pending display the change status dialog
      console.log("open pending 2", data);
      dialogRef = this.dialog.open(ChangeStatusComponent, {
        data,
        width: '30rem',
      });
    } else if(status === 'declined'){
      dialogRef = this.dialogService.open(ViewTeacherRejectionComponent, {context: {data: data}})
    }
    else {
      // otherwise display the update goal component
      console.log("updating with", data);
      dialogRef = this.dialogService.open(UpdateGoalComponent, {context: {data: data}});
    }

    dialogRef.onClose.subscribe((result) => {
      // reshow goals when dialog is closed
      if (result === 'updated' && this.accountType === 'student') {
        this.getGoalsForStudent(this.classID, this.email);
      }

      if(result && result.status == 'deleted'){
        let newGoals = this.goalsDataSource.filter(goal => goal != result.id);
        this.goalsDataSource = newGoals;
      }
    });

    //TODO: replace

    // dialogRef.onClose.subscribe(result => {
    //   if (result === 'updated' && this.accountType === 'student') {
    //     this.getGoalsForStudent(this.classID, this.email);
    //   }

    //   if(result && result.status == 'deleted'){
    //     let newGoals = this.goalsDataSource.filter(goal => goal != result.id);
    //     this.goalsDataSource = newGoals;
    //   }
    // });
  }

  async createGoalDialog() {
    // opens up the create goal dialog to create a new goal
    const data = {
      createdBy: this.user,
      teacherEmail: this.class.teacherEmail,
      classID: this.classID,
      students: [],
    };
    data.students = await this.classService.getStudentsDataByReference(this.class.students)
    // passes in class data into the dialog
    const dialogRef = this.dialogService.open(CreateGoalComponent, {
      context: {data: data}
    });

    dialogRef.onClose.subscribe((result) => {
      if (result === 'success') {
        // if a goal is created reshow goals
        this.getAllGoalsForTeacher(this.classID);
      }
    });
  }

  createStudentGoalDialog() {
    const data = {
      createdBy: this.user,
      classID: this.classID,
      students: this.classService.getStudentsDataByReference(this.class.students),
    };
    let goalData = new GoalClass(
      '',
      '',
      null,
      data.classID,
      [],
      [data.createdBy.email],
      [],
      '',
      data.createdBy,
      [data.createdBy.email]
    );

    this.dialogService.open(CreateStudentGoalComponent, {context: {goal: goalData}})
    .onClose.subscribe(result => {
      if(result == "success"){
            this.getAllGoalsForTeacher(this.classID);
      }
    });
  }

  // shows dialog for editing a goal
  editDialog(goal: GoalStat) {
    const editData = new GoalClass(
      goal.teacherEmail,
      goal.description,
      goal.dueDate,
      this.classID,
      goal.hasCompleted,
      goal.pending,
      goal.declined,
      goal.id,
      this.user,
      goal.assignedToID
    );
    console.log('edit data', editData);
    // inputs class data into dialog
    const dialogRef = this.dialogService.open(EditGoalComponent, {
     context: { data: editData}
    });

    dialogRef.onClose.subscribe((result) => {
      if (result === 'success' && this.accountType === 'teacher') {
        // if the goal is successfully edited, reshow goals
        this.getAllGoalsForTeacher(this.classID);
      }
    });
  }

  // opens up dialog to delete a goal
  deleteDialog(goal: GoalStat) {
    const deleteData = new GoalClass(
      goal.teacherEmail,
      goal.description,
      goal.dueDate,
      this.classID,
      goal.hasCompleted,
      goal.pending,
      goal.declined,
      goal.id,
      this.user,
      goal.assignedToID
    );
    const dialogRef = this.dialogService.open(DeleteGoalComponent, {
      context: {data: deleteData}
    });

    dialogRef.onClose.subscribe((result) => {
      if (result === 'success' && this.accountType === 'teacher') {
        // if the goal is successfully deleted, reshow goals
        this.getAllGoalsForTeacher(this.classID);
      }
    });
  }
}
