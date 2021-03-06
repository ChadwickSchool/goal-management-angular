import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { GoalService } from 'src/app/shared/services/goal.service';

@Component({
  selector: 'gms-change-status',
  templateUrl: './change-status.component.html',
  styleUrls: ['./change-status.component.scss']
})
export class ChangeStatusComponent {
  loading: boolean;
  teacherName: string;
  goalTitle: string;
  dueDate: Date;
  rejected: boolean;
  rejectionNote: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public dialogRef: MatDialogRef<ChangeStatusComponent>,
    private goalService: GoalService) {

    this.loading = true;
    this.teacherName = data.createdBy.name;
    this.goalTitle = data.description;
    this.dueDate = new Date(data.dueDate.seconds * 1000);
    this.loading = false;
    this.rejectionNote = '';
  }

  rejectGoal(status: boolean) {
    this.rejected = status;
  }

  updateStatus(status: string) {
    this.loading = true;
    this.goalService.updateGoalStatus(this.data.id, status, this.data.uid, this.rejectionNote).then(() => {
      this.dialogRef.close('updated');
    });
  }

}
