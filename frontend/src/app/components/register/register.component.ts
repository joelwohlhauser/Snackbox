import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SmsTokenDialogComponent } from '../sms-token-dialog/sms-token-dialog.component';
import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../../shared/style/signUpIn.scss', '../../app.component.scss']
})
export class RegisterComponent {
  public frmSignup: FormGroup;
  passwordHide = true;
  confirmHide = true;
  username: string | undefined;
  phoneNumber: string | undefined;
  password: string | undefined;
  smsToken: string | undefined;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private authService: AuthenticationService,
    private router: Router) {
    this.frmSignup = this.createSignupForm();
  }

  createSignupForm(): FormGroup {
    return this.fb.group(
      {
        phone: [
          null,
          Validators.compose([
            Validators.required,
            // check whether the entered text is a vaild phone number
            this.PatternValidator(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
              isValidPhoneNumber: true
            }),
          ])
        ],
        username: [
          null,
          Validators.compose([Validators.minLength(5), Validators.required])
        ],
        password: [
          null,
          Validators.compose([
            Validators.required,
            // check whether the entered password has a number
            this.PatternValidator(/\d/, {
              hasNumber: true
            }),
            // check whether the entered password has upper case letter
            this.PatternValidator(/[A-Z]/, {
              hasCapitalCase: true
            }),
            // check whether the entered password has a lower case letter
            this.PatternValidator(/[a-z]/, {
              hasSmallCase: true
            }),
            // check whether the entered password has a special character
            this.PatternValidator(
              /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
              {
                hasSpecialCharacters: true
              }
            ),
            Validators.minLength(8)
          ])
        ],
        confirmPassword: [null, Validators.compose([Validators.required])]
      },
      {
        // check whether our password and confirm password match
        validator: this.PasswordMatchValidator
      }
    );
  }

  PatternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null as any;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error as any;
    };
  }

  PasswordMatchValidator(control: AbstractControl) {
    const password: string = control.get('password')!.value; // get password from our password form control
    const confirmPassword: string = control.get('confirmPassword')!.value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmPassword')!.setErrors({ NoPassswordMatch: true });
    }
  }

  OpenSMSTokenDialog(): void {
    const dialogRef = this.dialog.open(SmsTokenDialogComponent, {
      width: '250px',
      data: { username: this.username, smsToken: this.smsToken }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.smsToken = result;
    });
  }

  async register(form: any) {
    try {
      const username = form.username;
      const phonenumber = form.phone;
      const password = form.password;
      await this.authService.register({ username, phonenumber, password }).toPromise();
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.log(err);
    }
  }

  googleSignIn() {
    this.authService.googleLogin();
  }

}
