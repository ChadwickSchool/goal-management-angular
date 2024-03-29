import { Component, Input, OnInit } from '@angular/core';
import { Class } from 'src/app/shared/models/class.model';
import { Goal } from 'src/app/shared/models/goal.model';
import { ClassService } from 'src/app/shared/services/class.service';
import { GoalStudentDataService } from 'src/app/shared/services/goal-student-data.service';
import { StudentData } from '../../class/class.component';

@Component({
  selector: 'gms-student-bar',
  templateUrl: './student-bar.component.html',
  styleUrls: ['./student-bar.component.scss']
})
export class StudentBarComponent implements OnInit {

  @Input() class: Class;
  @Input() goal: Goal;
  @Input() teacherEmail: string;
  students: StudentData[];
  // when highlightedStudent == 'all' show goal stats
  // when highlightedStudent == some student id: show goal stats for a particular student
  highlightedStudent = 'all';

  constructor(
    private classService: ClassService,
    private studentDataService: GoalStudentDataService,
    private studentGoalService: GoalStudentDataService) {
   }

  ngOnInit() {
    console.log('teacherEmail', this.teacherEmail);
    this.getStudentData();
  }

  getStudentData() { // get students assigned this goal
    this.classService.getStudentsDataByEmail(this.goal.assignedToID).then(studentData => {
      console.log('retrieved student data', studentData);
      this.students = studentData;
    });
  }

  viewStudentData(email: string) { // method for viewing students stats on goal
    this.studentDataService.setStudentGoalData(email, this.goal);
    this.highlightedStudent = email;
  }

  viewStudentsData() { // method for viewing all goal stats
    this.highlightedStudent = 'all';
    this.studentDataService.setStudentGoalData(null, null);
  }


}
