import { Component, OnInit } from '@angular/core';
import { Recipe } from 'src/app/models/recipe';
import { RecipeService } from 'src/app/services/recipe.service';

export interface Iapi_publicRecipe {
  id: string,
  title: string,
  cookingtime: number,
  servingsize: number,
  autor: string,
  imageurl: string,
}

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss', '../../app.component.scss']
})
export class ExploreComponent implements OnInit {
  publicRecipes: Recipe[] = [];

  constructor(
    private recipeService: RecipeService,
  ) {
    this.recipeService.getPublicRecipes().then((data) => {
      data.forEach((element: Iapi_publicRecipe) => {
        var newRecipe: Recipe = {
          title: element.title,
          cookingTime: element.cookingtime,
          servingSize: element.servingsize,
          autor: element.autor,
          statusNumber: 1,
          id: element.id,
          imageURL: element.imageurl,
          ingredients: "",
          preparation: ""
        };
        this.publicRecipes.push(newRecipe);
      });
    })
  }

  ngOnInit(): void {
  }

}
