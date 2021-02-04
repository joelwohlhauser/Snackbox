import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe } from '../models/recipe';
import { AuthenticationService } from './authentication.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private baseUrl = 'http://localhost:3001';
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthenticationService) { }

  async getAdminRecipes(): Promise<any> {
    return this.http.get<any>(
      this.baseUrl + '/api/admin/getAllPosts',
      { headers: this.authService.headers }
    ).toPromise();
  }

  async getUserRecipes(): Promise<any> {
    return this.http.get<any>(
      this.baseUrl + '/api/user/' + sessionStorage.getItem('username') || "",
      { headers: this.authService.headers }
    ).toPromise();
  }

  async getPublicRecipes(): Promise<any> {
    return this.http.get<any>(
      this.baseUrl + '/api/recipes'
    ).toPromise();
  }

  newRecipe(): void {
    // create new recipe with random ID in preparation field
    let newRecipe = new Recipe();
    const newRecipeId = this.getRandomId(20);
    newRecipe.preparation = newRecipeId;
    const body = {
      "title": newRecipe.title,
      "cookingTime": newRecipe.cookingTime,
      "servingSize": newRecipe.servingSize,
      "ingredients": newRecipe.ingredients,
      "preparation": newRecipe.preparation,
      "imageUrl": newRecipe.imageURL
    }
    this.http.post<any>(
      this.baseUrl + '/api/' + (sessionStorage.getItem('username') || "") + "/newRecipe",
      body,
      { headers: this.authService.headers }
    ).subscribe(() => {

      // search in DB for recipe with this ID
      this.http.get<any>(
        this.baseUrl + '/api/user/' + sessionStorage.getItem('username') || "",
        { headers: this.authService.headers }
      ).subscribe((data) => {
        data.forEach((element: { preparation: string, id: string }) => {
          if (element.preparation == newRecipeId) {

            // remove ID from preperation field
            newRecipe.preparation = "write preparation";
            newRecipe.id = element.id;
            this.updateRecipe(newRecipe).then(() => {
              this.wait(100);
              // redirect to this recipe
              this.router.navigateByUrl('/recipe/' + element.id);
            });
          }
        });
      });
    })
  }

  wait(ms: number): void {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
  }

  getRandomId(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  newComment(recipeId: string, commentText: string): Promise<any> {
    const body = {
      "text": commentText,
    }
    return this.http.post<any>(
      this.baseUrl + '/api/recipe/' + recipeId + "/comment",
      body,
      { headers: this.authService.headers }
    ).toPromise();
  }

  async getComments(recipeId: string): Promise<any> {
    return this.http.get<any>(
      this.baseUrl + '/api/recipe/' + recipeId + "/getComments",
    ).toPromise();
  }

  async getRecipe(recipeID: string): Promise<any> {
    return this.http.get<any>(
      this.baseUrl + '/api/recipe/' + recipeID,
      { headers: this.authService.headers }
    ).toPromise();
  }

  async updateRecipe(updatedRecipe: Recipe): Promise<any> {
    const body = {
      "title": updatedRecipe.title,
      "cookingTime": updatedRecipe.cookingTime,
      "servingSize": updatedRecipe.servingSize,
      "ingredients": updatedRecipe.ingredients,
      "preparation": updatedRecipe.preparation,
      "statusNumber": updatedRecipe.statusNumber,
      "imageUrl": updatedRecipe.imageURL
    }
    return this.http.post<any>(
      this.baseUrl + '/api/' + (sessionStorage.getItem('username') || "") + "/" + updatedRecipe.id + "/edit",
      body,
      { headers: this.authService.headers }
    ).toPromise();
  }

}
