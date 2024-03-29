import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './shared/material.module';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatAutocompleteModule, MatNativeDateModule} from '@angular/material';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { environment } from 'src/environments/environment';
import {FlexLayoutModule} from '@angular/flex-layout';
import { SideNavbarComponent } from './side-navbar/side-navbar.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { HomeComponent } from './home/home.component';
import { UpdateGoalComponent } from './dialogs/update-goal/update-goal.component';

import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClassListComponent } from './teacher/class-list/class-list.component';
import { ClassComponent } from './teacher/class/class.component';
import { CreateGoalComponent } from './dialogs/create-goal/create-goal.component';
import { EditGoalComponent } from './dialogs/edit-goal/edit-goal.component';
import { GoalsComponent } from './goals/goals.component';
import { DeleteGoalComponent } from './dialogs/delete-goal/delete-goal.component';
import { UploadLinkComponent } from './dialogs/upload-link/upload-link.component';
import { UploaderComponent } from './dialogs/upload-file/uploader/uploader.component';
import { ViewStudentDataComponent } from './teacher/view-student-data/view-student-data.component';
import { GoalDashboardComponent } from './teacher/view-goal-data/goal-dashboard/goal-dashboard.component';
import { StudentBarComponent } from './teacher/view-goal-data/student-bar/student-bar.component';
import { GoalDetailsComponent } from './teacher/view-goal-data/goal-details/goal-details.component';
import { ChangeStatusComponent } from './dialogs/change-status/change-status.component';
import { HelpComponent } from './help/help.component';
import { CreateStudentGoalComponent } from './dialogs/create-student-goal/create-student-goal.component';
import { UploadCommitComponent } from './dialogs/upload-commit/upload-commit.component';
import { CreateClassComponent } from './dialogs/create-class/create-class.component';
import { DirectorViewComponent } from './director/director-view/director-view.component';
import { DirectorClassComponent } from './director/director-class/director-class.component';
import { CreateStudentComponent } from './dialogs/create-student/create-student.component';
import { DeleteStudentComponent } from './dialogs/delete-student/delete-student.component';
import { UpdateClassComponent } from './dialogs/update-class/update-class.component';
import { DeleteClassComponent } from './dialogs/delete-class/delete-class.component';
import { WarningPendingComponent } from './dialogs/warning-pending/warning-pending.component';
import { ViewTeacherRejectionComponent } from './dialogs/view-teacher-rejection/view-teacher-rejection.component';
import { NbThemeModule, NbLayoutModule, NbButtonModule, NbIconModule, NbCardModule, NbDialogModule, NbDialogService, NbSpinnerModule, NbDialogRef, NbDatepickerModule, NbInputModule, NbTreeGridModule, NbListModule, NbRadioModule, NbCheckboxModule, NbSelectModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { SpinnerComponent } from './spinner/spinner.component';



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SideNavbarComponent,
    HomeComponent,
    UpdateGoalComponent,
    ClassListComponent,
    ClassComponent,
    CreateGoalComponent,
    EditGoalComponent,
    GoalsComponent,
    DeleteGoalComponent,
    UploadLinkComponent,
    UploaderComponent,
    ViewStudentDataComponent,
    GoalDashboardComponent,
    StudentBarComponent,
    GoalDetailsComponent,
    ChangeStatusComponent,
    HelpComponent,
    CreateStudentGoalComponent,
    UploadCommitComponent,
    CreateClassComponent,
    DirectorViewComponent,
    DirectorClassComponent,
    CreateStudentComponent,
    DeleteStudentComponent,
    UpdateClassComponent,
    DeleteClassComponent,
    WarningPendingComponent,
    ViewTeacherRejectionComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatAutocompleteModule,
    MaterialModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatPaginatorModule,
    FlexLayoutModule,
    AngularFireFunctionsModule,
    MatMenuModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MatRadioModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbButtonModule,
    NbIconModule,
    NbCardModule,
    NbDialogModule.forRoot(), 
    NbEvaIconsModule,
    NbInputModule,
    NbSpinnerModule,
    NbSelectModule,
    NbDatepickerModule.forRoot(),
    NbTreeGridModule,
    NbListModule,
    NbRadioModule,
    NbCheckboxModule
  ],
  providers: [NbDialogService],
  bootstrap: [AppComponent],
  entryComponents: [UpdateGoalComponent, CreateGoalComponent, EditGoalComponent,
    DeleteGoalComponent, UploadLinkComponent, UploaderComponent, ChangeStatusComponent,
     CreateStudentGoalComponent, UploadCommitComponent, CreateClassComponent, CreateStudentComponent, DeleteStudentComponent, UpdateClassComponent, DeleteClassComponent, WarningPendingComponent, ViewTeacherRejectionComponent]
})
export class AppModule { }
