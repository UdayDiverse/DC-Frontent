import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoggedInUserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';
// import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['header-bar.component.scss'],
  standalone: true,
})
export class HeaderBarComponent {
  userService = inject(LoggedInUserService);
  authService = inject(AuthService);
  userName = signal('');

  constructor(private router: Router) {}

  ngOnInit() {
    this.userName = this.userService.getLoggedInUser();
  }
  logout() {
    this.authService.logout();
    // this.router.navigate(['/']);
  }
}
