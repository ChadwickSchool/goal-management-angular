import {Component, Inject} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { GoalService } from 'src/app/shared/services/goal.service';
import { Goal } from '../../shared/models/goal.model';

@Component({
  selector: 'gms-update-goal',
  templateUrl: './update-goal.component.html',
  styleUrls: ['./update-goal.component.scss']
})


export class UpdateGoalComponent{
  madeChanges:boolean = false;
  isLoading:boolean = false;
  currentGoal: Goal;
  isCompleted: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UpdateGoalComponent>, private afs: AngularFirestore, private goalService: GoalService) {
    this.currentGoal = {description: data.description, dueDate: data.dueDate, hasCompleted: data.hasCompleted, createdBy: data.createdBy,
      assignedToID: data.assignedToID, id: data.id, classID: data.classID};
    this.isCompleted = data.isCompleted;
   }


  updateGoal(isDone){
    console.log(this.currentGoal, "current goal");
    this.madeChanges = true;
    this.isLoading = true;
    if(isDone){ // mark as done
      this.goalService.completeGoal(this.currentGoal, this.data.uid).then(() => {
        this.isLoading = false;
        this.madeChanges = true;
        this.dialogRef.close('updated');
      });
    }else{// unsubmit
      this.goalService.unsubmitGoal(this.currentGoal, this.data.uid).then(() => {
        this.isLoading = false;
        this.madeChanges = true;
        this.dialogRef.close('updated');
      });
    }
  }


}