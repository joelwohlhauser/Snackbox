import { Component, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SmsTokenDialogComponent } from '../sms-token-dialog/sms-token-dialog.component';
import { SocialAuthService, GoogleLoginProvider } from "angularx-social-login";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../../shared/style/signUpIn.scss', '../../app.component.scss']
})
export class LoginComponent {
  public frmSignin: FormGroup;
  passwordHide = true;
  username: string | undefined;
  password: string | undefined;
  smsToken: string | undefined;
  gotError = false;
  errorText = "";

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private socialAuthService: SocialAuthService,
    private zone: NgZone,
    private router: Router) {
    this.frmSignin = this.createSignupForm();
    router.events.subscribe(() => {
      this.activatedRoute.queryParams
        .subscribe(params => {
          if (params.error != null) {
            this.gotError = true;
            switch (params.error) {
              case "UserDoesNotExist":
                this.errorText = "This user does not exist."
                break;
              case "WrongToken":
                this.errorText = "SMS token was wrong."
                break;
              case "LoginFailed":
                this.errorText = "Username or password was wrong."
                break;
              case "GoogleLoginFailed":
                this.errorText = "Google login failed. Didn't get any data from Google.";
                break;
              case "GoogleLoginFailedDB":
                this.errorText = "Google login failed. Couldn't create new user."
                break;
              case "ExpiredToken":
                this.errorText = "Token is expired."
                break;
              case "UserBlocked":
                this.errorText = "This user has been blocked for a period of time."
                break;
              default:
                this.gotError = false;
                break;
            }
          } else {
            this.gotError = false;
          }
        });
    });
  }

  createSignupForm(): FormGroup {
    return this.fb.group(
      {
        username: [
          null,
          Validators.compose([Validators.minLength(5), Validators.required])
        ],
        password: [
          null,
          Validators.compose([Validators.minLength(8), Validators.required])
        ]
      }
    );
  }

  async OpenSMSTokenDialog(username: string, password: string) {
    // generate random 6 digit token
    const token = (Math.floor(100000 + Math.random() * 900000)).toString();
    let expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (5 * 60 * 1000));

    this.authService.sendSMSToken(username, token).toPromise();

    const dialogRef = this.dialog.open(SmsTokenDialogComponent, {
      width: '250px',
      data: { username, smsToken: this.smsToken }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result != null) {
        if (result == token) {
          let date = new Date();
          if (expiryDate.getTime() < date.getTime()) {
            this.authService.LoginFailed(username);
            this.router.navigate(['/login'], { queryParams: { error: 'ExpiredToken' } })
          } else {
            this.authService.login(username, password);
          }
        } else {
          this.authService.LoginFailed(username);
          this.router.navigate(['/login'], { queryParams: { error: 'WrongToken' } });
        }
      }
    });
  }

  async login(form: any) {
    if (this.authService.checkIfUserIsBlocked(form.username)) {
      this.router.navigate(['/login'], { queryParams: { error: 'UserBlocked' } });
    } else {
      this.authService.checkIfUserExists(form.username).then((data: { userExists: boolean }) => {
        if (data.userExists) {
          this.OpenSMSTokenDialog(form.username, form.password);
        } else {
          this.router.navigate(['/login'], { queryParams: { error: 'UserDoesNotExist' } });
        }
      });
    }
  }

  googleSignIn() {
    this.authService.googleLogin();
  }

}
