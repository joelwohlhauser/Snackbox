import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { RecipeService } from 'src/app/services/recipe.service';
import { Recipe } from 'src/app/models/recipe';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatSnackBar, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';

export interface Iapi_usersRecipe {
  id: string,
  title: string,
  cookingtime: number,
  servingsize: number,
  username: string,
  statusNumber: number
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', '../../app.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  horizontalSnackBarPosition: MatSnackBarHorizontalPosition = 'start';
  routeSub: Subscription | undefined;
  public frmChangePhone: FormGroup;
  username: string = "";
  isAdmin: boolean = false;
  isGoogleUser: boolean = false;
  phoneNumber: string | undefined;
  smsToken: string | undefined;
  passwordHide = true;
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<Recipe>;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private recipeService: RecipeService,
    private authService: AuthenticationService,
  ) {
    this.frmChangePhone = this.CreateChangePhoneForm();
    this.dataSource = new MatTableDataSource(new Array);
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('isAdmin') == "true") {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }

    if (sessionStorage.getItem('isGoogleUser') == "true") {
      this.isGoogleUser = true;
    } else {
      this.isGoogleUser = false;
    }

    var recipesArray = new Array;
    this.username = sessionStorage.getItem('username') || ""

    if (this.isAdmin) {
      this.recipeService.getAdminRecipes().then((data) => {
        data.forEach((element: Iapi_usersRecipe) => {
          var newRecipe: Recipe = {
            title: element.title,
            cookingTime: element.cookingtime,
            servingSize: element.servingsize,
            autor: element.username,
            statusNumber: element.statusNumber,
            id: element.id,
            imageURL: "",
            ingredients: "",
            preparation: ""
          };
          newRecipe.statusText = this.getStatusTextFromNumber(newRecipe.statusNumber);
          recipesArray.push(newRecipe);
        });
        this.dataSource = new MatTableDataSource(recipesArray);
      });
      this.displayedColumns = ['recipe', 'cookingTime', 'servingSize', 'autor', 'status'];
    } else {
      this.recipeService.getUserRecipes().then((data) => {
        data.forEach((element: Iapi_usersRecipe) => {
          var newRecipe: Recipe = {
            title: element.title,
            cookingTime: element.cookingtime,
            servingSize: element.servingsize,
            autor: this.username,
            statusNumber: element.statusNumber,
            id: element.id,
            imageURL: "",
            ingredients: "",
            preparation: ""
          };
          newRecipe.statusText = this.getStatusTextFromNumber(newRecipe.statusNumber);
          recipesArray.push(newRecipe);
        });
        this.dataSource = new MatTableDataSource(recipesArray);
      });
      this.displayedColumns = ['recipe', 'cookingTime', 'servingSize', 'status'];
    }
  }

  getStatusTextFromNumber(statusNumber: number): string {
    switch (statusNumber) {
      case 1:
        return "Published";
      case 2:
        return "Private";
      case 3:
        return "Deleted";
      default:
        return "";
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  CreateChangePhoneForm(): FormGroup {
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
        password: [
          null,
          Validators.compose([Validators.minLength(8), Validators.required])
        ]
      },
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

  ChangePhoneNumber(): void {
    this.authService.changePhoneNumber(this.frmChangePhone.value.phone, this.frmChangePhone.value.password)
      .then((data: { message: string }) => {
        let snackBarMessage = "✅ Successfully changed"
        if (data.message != "Phonenumber changed.") {
          snackBarMessage = "❌ Failed";
          console.log(data);
        }
        this._snackBar.open(snackBarMessage, "", {
          duration: 2000,
          horizontalPosition: this.horizontalSnackBarPosition,
        });
      });
  }
}
