import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Class } from 'src/app/shared/models/class.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ClassService } from '../../shared/services/class.service';

@Component({
  selector: 'gms-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss'],
})
export class ClassListComponent {
  classes: Class[];
  loading = true;
  constructor(
    private classService: ClassService,
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.user$.subscribe(async (userProfile) => {
      if (!userProfile) {
        return;
      }
      this.getClasses(userProfile.email);
    });
  }

  goToCard(classID: string) {
    this.router.navigate([`/classes/${classID}`]);
  }

  getClasses(email: string) {
    this.classes = this.classService.getClassesByEmail(email);
    this.loading = false;
  }
}
