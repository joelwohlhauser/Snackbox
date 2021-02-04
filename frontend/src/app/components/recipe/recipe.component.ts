import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChangeImageDialogComponent } from '../change-image-dialog/change-image-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Recipe } from '../../models/recipe'
import { Comment } from '../../models/comment'
import { RecipeService } from 'src/app/services/recipe.service';


export interface Iapi_singleRecipe {
  id: string,
  title: string,
  cookingtime: number,
  servingsize: number,
  autor: string
  statusNumber: number,
  imageurl: string,
  ingredients: string,
  preparation: string;
}

export interface Iapi_comment {
  text: string,
  username: string,
}

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss', '../../app.component.scss']
})
export class RecipeComponent implements OnInit {
  horizontalSnackBarPosition: MatSnackBarHorizontalPosition = 'start';
  routeSub: Subscription | undefined;
  myRecipe: Recipe = new Recipe;
  username: string = "";
  myComments: Comment[] = [];
  commentText: string = "";
  canEditRecipe = false;
  isLoggedIn = false;

  constructor(
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      if (params['recipeId'] == undefined || params['recipeId'] == "new") {
        this.recipeService.newRecipe();
      } else {
        this.username = sessionStorage.getItem('username') || ""
        this.recipeService.getRecipe(params['recipeId']).then((data: Iapi_singleRecipe) => {
          var newRecipe: Recipe = {
            title: data.title,
            cookingTime: data.cookingtime,
            servingSize: data.servingsize,
            autor: data.autor,
            statusNumber: data.statusNumber,
            id: data.id,
            imageURL: data.imageurl,
            ingredients: data.ingredients,
            preparation: data.preparation
          };

          // check if user has access to this recipe
          if (sessionStorage.getItem('isAdmin') == "true") {
            this.canEditRecipe = true;
          } else {
            if (this.username == newRecipe.autor) {
              this.canEditRecipe = true;
            } else {
              this.canEditRecipe = false;
              if (newRecipe.statusNumber !== 1) {
                this.router.navigateByUrl('/explore');
              }
            }
          }

          // check if logged in
          if (this.username != "") {
            this.isLoggedIn = true;
          } else {
            this.isLoggedIn = false;
          }

          this.getComments(newRecipe.id)

          this.myRecipe = newRecipe;
        });
      }
    });
  }

  getComments(recipeId: string): void {
    this.recipeService.getComments(recipeId).then((data) => {
      let newCommentsArray: Comment[] = []
      data.forEach((element: Iapi_comment) => {
        var newComment: Comment = {
          text: element.text,
          username: element.username,
        };
        newCommentsArray.unshift(newComment);
      });
      this.myComments = newCommentsArray
    })
  }

  UpdateRecipe(): void {
    this.recipeService.updateRecipe(this.myRecipe)
      .then((data: { message: string }) => {
        if (data.message == "Recipe saved.") {
          this.ShowSnackBar("✅ Successfully saved");
        } else {
          this.ShowSnackBar("❌ Update failed");
          console.log(data);
        }
      });
  }

  ValueChanged(whatChanged: string, event: FocusEvent): void {
    const newValue = (event.target as HTMLInputElement).textContent;
    if (newValue != null) {
      switch (whatChanged) {
        case "title":
          this.myRecipe.title = newValue;
          break;
        case "cookingTime":
          this.myRecipe.cookingTime = Number(newValue);
          break;
        case "servingSize":
          this.myRecipe.servingSize = Number(newValue);
          break;
        case "ingredients":
          this.myRecipe.ingredients = newValue;
          break;
        case "preparation":
          this.myRecipe.preparation = newValue;
          break;
        default:
          this.ShowSnackBar("❌ Update failed");
          break;
      }
      this.UpdateRecipe();
    } else {
      this.ShowSnackBar("❌ Update failed");
    }
  }

  ChangeStatus(newStatus: any): void {
    this.myRecipe.statusNumber = Number(newStatus);
    if (this.myRecipe.statusNumber == 3) {
      this.UpdateRecipe();
      if (sessionStorage.getItem('isAdmin') != "true") {
        this.router.navigateByUrl('/dashboard');
      }
    } else {
      this.UpdateRecipe();
    }
  }

  ChangeImage(): void {
    if (this.username == this.myRecipe.autor) {
      const dialogRef = this.dialog.open(ChangeImageDialogComponent, {
        width: '500px',
        data: { imageURL: null }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != null) {
          this.myRecipe.imageURL = result;
          this.UpdateRecipe();
        }
      });
    }
  }

  PostComment(commentText: string): void {
    if (commentText != null) {
      if (commentText.replace(/\s/g, '').length) {
        if (commentText.length > 200) {
          this.ShowSnackBar("❌ Comment too long");
          return;
        }
        this.recipeService.newComment(this.myRecipe.id, commentText)
          .then((data: { message: string }) => {
            if (data.message == "Comment saved.") {
              this.ShowSnackBar("✅ posted successfully");

              // update comments
              this.myComments = [];
              this.getComments(this.myRecipe.id);
              this.commentText = "";
            } else {
              this.ShowSnackBar("❌ Posting comment failed");
              console.log(data);
            }
          });
      }
    }
  }


  NumbersOnly(event: KeyboardEvent): boolean {
    return (/^([0-9])$/).test(event.key);
  }

  DisableEnter(e: KeyboardEvent): void {
    // If enter and shift are pressed then don't allow to create a new line
    if ((e.key == "Enter" && e.shiftKey) || e.key == "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
    else {
      e.stopPropagation();
    }
  }

  ShowSnackBar(customMessage: string): void {
    this._snackBar.open(customMessage, "", {
      duration: 1000,
      horizontalPosition: this.horizontalSnackBarPosition,
    });
  }
}
