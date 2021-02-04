import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
  ) {
    router.events.subscribe(() => {
      this.isLoggedIn = this.authService.isLoggedIn();
    });
  }

  signOut(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
