export class Recipe {
  id: string = "";
  imageURL: string = "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1636&q=80";
  title: string = "Recipe";
  cookingTime: number = 25;
  servingSize: number = 4;
  autor: string = "autor";
  statusNumber: number = 2;
  statusText?: string = "";
  ingredients: string = "list all ingredients";
  preparation: string = "write preparation";
}