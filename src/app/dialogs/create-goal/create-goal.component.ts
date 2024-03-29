import { Component, Inject, OnInit, Optional } from '@angular/core';
import { GoalService } from 'src/app/shared/services/goal.service';
import { StudentData } from 'src/app/teacher/class/class.component';
import GoalClass from '../../shared/models/goal';
import { NbDialogRef, NbDialogService } from '@nebular/theme';

@Component({
  selector: 'gms-create-goal',
  templateUrl: './create-goal.component.html',
  styleUrls: ['./create-goal.component.scss']
})

export class CreateGoalComponent implements OnInit {
  goal: GoalClass;
  loading = false;
  assignedStudentID: string[] = [];
  assignedToAll: boolean = false;
  dateErrors: string = "";
  public data: any;

  constructor(private goalService: GoalService,
              @Optional() protected dialogRef: NbDialogRef<CreateGoalComponent>) {
    
   }

  ngOnInit() {
    if(this.data){
      this.goal = new GoalClass(this.data.teacherEmail,'', null, this.data.classID, [], [], [], '', this.data.createdBy, []);
    }
  }

  assignAllStudents() {
    console.log("data", this.data);
    this.assignedStudentID = [];
    this.data.students.forEach(student => {
      this.assignedStudentID.push(student.email);
    });
  }


  formComplete(): boolean {
    return this.assignedStudentID.length > 0 && this.goal.description.trim() !== '' && this.goal.dueDate != null && this.goal.description.length <= 40 && !this.checkDateErrors();
  }

  checkSpecific(studentID: string, assigned: boolean) {
    console.log("checked", studentID, assigned)
    if (assigned) {
      this.assignedStudentID.push(studentID);
    } else { // removes from assigned student array
      this.assignedStudentID = this.assignedStudentID.filter(id => id != studentID);
    }
  }

  resetList() {
    this.assignedToAll = false;
    console.log(this.assignedToAll);
    this.assignedStudentID = [];
  }

  checkDateErrors(): boolean {
    if(this.goal.dueDate){
      let beforeDateOffset = new Date(this.goal.dueDate.getTime() + (24*60*60*1000));
      let afterDateOffset = new Date(this.goal.dueDate.getTime() - (24*60*60*1000 * 14));
      if (beforeDateOffset < new Date()) {
        this.dateErrors = "Due date cannot be before or during today";
        return true;
      }else if(afterDateOffset > new Date()){
        this.dateErrors = "Due date must be within 2 weeks";
        return true;
      }
    }
    return false;
  }

  closeDialog(){
    this.dialogRef.close();
  }

  createGoal() {
    this.loading = true;
    this.goal.assignedToID = this.assignedStudentID;
    this.goal.description = this.goal.description.trim();
    console.log(this.goal.assignedToID);
    this.goalService.createGoal(this.goal).then(() => {
      this.loading = false;
      this.dialogRef.close('success');
    });
  }


}
