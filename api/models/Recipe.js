class Recipe {
  constructor(title, cookingTime, servingSize, status, ingredients, preparation, imageUrl, user_id) {
    this.title = title;
    this.cookingTime = cookingTime;
    this.servingSize = servingSize;
    this.status = status;
    this.ingredients = ingredients;
    this.preparation = preparation;
    this.imageUrl = imageUrl;
    this.user_id = user_id;
  }
}
module.exports = Recipe;