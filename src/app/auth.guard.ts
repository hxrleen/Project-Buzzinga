import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BuzzService } from './buzz.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private buzzService: BuzzService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const roomId = next.paramMap.get('roomId');
    if (roomId && this.buzzService.isValidRoom(roomId)) {
      return true;
    } else {
      this.router.navigate(['/']); // Redirect to home or some other route
      return false;
    }
  }
}
