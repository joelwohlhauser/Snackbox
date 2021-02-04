import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SocialAuthService, GoogleLoginProvider } from "angularx-social-login";

export interface UserAuthDetails {
  username?: string;
  password?: string;
  phonenumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private baseUrl = 'http://localhost:3001';
  public headers!: { Authorization: string; loggedInUser: string; };
  public blockDate: Date = new Date();

  constructor(
    private http: HttpClient,
    private router: Router,
    private socialAuthService: SocialAuthService,
  ) {
    this.updateHeaders();
  }

  saveUserData(username: string, token: string): void {
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('username', username);
    localStorage.removeItem("failedLoginAtteps");
    localStorage.removeItem("blockedDate");
    localStorage.removeItem("blockedUser");
    this.updateHeaders();
    this.http.get<any>(
      this.baseUrl + '/api/admin/' + username + '/isUserAdmin',
      { headers: this.headers }
    ).subscribe(data => {
      sessionStorage.setItem('isAdmin', data.isUserAdmin);
      if (data.isUserAdmin) {
        this.router.navigateByUrl('/admin/dashboard');
      } else {
        this.router.navigateByUrl('/user/dashboard');
      }
    })
  }

  LoginFailed(username: string): void {
    if (!this.checkIfUserIsBlocked(username)) {
      switch (localStorage.getItem('failedLoginAtteps')) {
        case "null":
        case undefined:
        case "":
        case null:
          localStorage.setItem("failedLoginAtteps", "1");
          break;
        case "1":
          localStorage.setItem("failedLoginAtteps", "2");
          break;
        case "2":
          localStorage.setItem("blockedUser", username);
          localStorage.setItem("blockedDate", (new Date).toString());
          break;
        default:
          break;
      }
    }
  }

  checkIfUserIsBlocked(username: string): boolean {
    if (localStorage.getItem('blockedUser') == username &&
      (Math.abs(<any>new Date() - <any>new Date((localStorage.getItem('blockedDate') || "")))) < 5 * 60 * 1000) {
      return true;
    } else {
      localStorage.removeItem("blockedDate");
      localStorage.removeItem("blockedUser");
      return false;
    }
  }

  async checkIfUserExists(username: string): Promise<any> {
    return this.http.get<any>(
      this.baseUrl + '/api/check/' + username + "/UserExists",
      { headers: this.headers }
    ).toPromise();
  }

  isLoggedIn(): boolean {
    if (sessionStorage.getItem('username') && sessionStorage.getItem('authToken')) {
      return true;
    } else {
      return false;
    }
  }

  updateHeaders(): void {
    this.headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('authToken') || "",
      'loggedInUser': sessionStorage.getItem('username') || ""
    };
  }

  loginWithToken(token: string) {
    return new Promise<void>((resolve) => {
      sessionStorage.setItem('authToken', token);
      resolve();
    })
  }


  login2(username: string, password: string): Promise<any> {
    return this.http.post<any>(
      this.baseUrl + '/api/login',
      { username, password },
    ).toPromise();
  }

  public login(username: string, password: string): void {
    this.http.post<any>(
      this.baseUrl + '/api/login',
      { username, password }
    ).subscribe((data: any) => {
      if (data.token) {
        this.saveUserData(username, data.token);
      } else {
        this.LoginFailed(username);
        this.router.navigate(['/login'], { queryParams: { error: 'LoginFailed' } });
      }
    });
  }

  logout() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('isGoogleUser');
    this.updateHeaders();
    this.router.navigateByUrl('/login');
    return of({}).pipe(delay(500))
  }

  public register(user: UserAuthDetails) {
    return this.http.post(this.baseUrl + '/api/register', user).pipe(
      map((data: any) => {
        if (user.username && data.token) {
          this.saveUserData(user.username, data.token);
        } else {
          this.router.navigate(['/register']);
        }
      })
    );
  }

  public sendSMSToken(username: string, token: string) {
    return this.http.post(this.baseUrl + '/api/smstoken', { username, token })
  }

  public changePhoneNumber(newNumber: string, password: string): Promise<any> {
    const body = {
      "newPhoneNumber": newNumber,
      "password": password,
    }
    return this.http.post<any>(
      this.baseUrl + '/api/' + (sessionStorage.getItem('username') || "") + "/changePhoneNumber",
      body,
      { headers: this.headers }
    ).toPromise();
  }

  public googleLogin(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      async (data: any) => {
        if (data) {
          await this.createGoogleUser(data).toPromise();
        } else {
          this.router.navigate(['/login'], { queryParams: { error: 'GoogleLoginFailed' } });
        }
      }
    );
  }

  private createGoogleUser(googleUser: any) {
    // create username out of name
    const username = (googleUser.name.toLowerCase()).split(/[ ,]+/).join('.')
    const email = googleUser.email

    return this.http.post(this.baseUrl + '/api/google', { username, email }).pipe(
      map((data: any) => {
        if (data.token) {
          sessionStorage.setItem('isGoogleUser', "true");
          this.saveUserData(username, data.token);
        } else {
          this.router.navigate(['/login'], { queryParams: { error: 'GoogleLoginFailedDB' } });
        }
      })
    )
  }

}
