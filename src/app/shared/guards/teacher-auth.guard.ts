import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TeacherAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  // check if user is a teacher
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.authService.user$.subscribe(async (userProfile) => {
      if (userProfile == null || userProfile.accountType !== 'teacher') {
        this.router.navigate(['/']);
      }
    });
    return true;
  }
}
