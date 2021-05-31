import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { startWith } from 'rxjs/operators';
import { User } from 'src/app/shared/models/user.model';
import { DirectorService } from 'src/app/shared/services/director.service';

@Component({
  selector: 'gms-create-student',
  templateUrl: './create-student.component.html',
  styleUrls: ['./create-student.component.scss']
})
export class CreateStudentComponent implements OnInit {
  loading: boolean = false;
  userValue = new FormControl();
  studentEmail: string = "";
  studentData: User[] = [];
  filteredOptions: Observable<User[]>;
  errorMessage:string = "";
  emailErrorMessage:string = "";
  constructor(
    private director: DirectorService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateStudentComponent>
    ) { }

  ngOnInit() {
    this.director.getAllStudentData().then((result) => {
      this.studentData = result;
      console.log("student data", this.studentData);
    });

    this.filteredOptions = this.userValue.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filter(name) : this.studentData.slice())
      );
  }

  formComplete(): boolean{
    return (this.userValue.value && this.userValue.value.email != null) || (this.studentEmail.length > 0);
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    console.log("calling", name);
    const filterValue = name.toLowerCase();

    return this.studentData.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  checkChadwickEmail(email: string){
    const chadwickRegex = /^[\w-\.]+@([chadwickschool+\.])+[\w-]{2,4}$/;
    return chadwickRegex.test(String(email).toLowerCase());
  }

  checkContainsEmail(email: string){
    for(let student of this.studentData){
      if(student.email == email){
        return true;
      }
    }
    return false;
  }


  // TODO: clean up code
  createStudent(){
      this.loading = true;
      if(this.studentEmail.length > 0 && (this.userValue.value == null || this.userValue.value.email == null)){
        if(!this.validateEmail(this.studentEmail)){
          this.emailErrorMessage = "Please enter a valid email";
          this.loading = false;
          return;
        }else if(!this.checkChadwickEmail(this.studentEmail)){
          this.emailErrorMessage = "Please enter a valid Chadwick email";
          this.loading = false;
          return;
        }else if(this.checkContainsEmail(this.studentEmail)){
          this.emailErrorMessage = "User already exists. Please add user instead.";
          this.loading = false;
          return;
        }else{
          this.emailErrorMessage = "";

          return;
        }
      }
      this.director.createStudentForClass(this.data.id, this.userValue.value).then((result) => {
        // close dialog
        if(this.data){
          console.log("closing with", this.data);
          this.dialogRef.close(this.userValue.value);
        }else{
          this.dialogRef.close();
        }
      }).catch((err) => {
        alert("Something went wrong. Please try again");
      })
  }


}
