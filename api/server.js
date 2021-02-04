const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require("fs");
const path = require('path');
const passport = require('passport');
const log4j = require("log4js");
require('./models/services/passport');
const Recipe = require("./models/Recipe");
const auth = require('./models/services/authenticate');
const queries = require('./models/services/queries');
const sha256 = require('js-sha256');


const app = express();

//Morgan Setup: Logging der Requests
var accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/requests.log'), { flags: 'a' });
morgan.token('username', function (req, res) { return req.headers['loggedinuser'] });
app.use(morgan(":username - :method - :url - :status - :response-time ms", { stream: accessLogStream }));

app.use(cors());
app.use(helmet());

//Log4j Config
log4j.configure({
  appenders: { snackbox: { type: "file", filename: "../logs/snackbox.log" } },
  categories: { default: { appenders: ["snackbox"], level: "info" } }
});
const logger = log4j.getLogger("snackbox");

// passport middleware
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)

app.use(passport.initialize());

// simple route
app.get("/api", async (req, res) => {
  var user = await queries.getUser("Test123");
  var a = auth.generateJWT(user);

  res.json(JSON.stringify(a));
});

// register
app.post('/api/register', auth.register);

// login
app.post("/api/login", auth.login);

// ** SMS Login ** 

// send sms
app.post("/api/smstoken", auth.sendSMSToken);

// google
app.post("/api/google", auth.googleLogin);

//User
app
  //create new recipe
  .post("/api/:username/newRecipe", async (req, res) => {

    var err = await checkRequest(req, res, false, false);
    if (err) return;

    var username = req.params.username;
    var recipe = new Recipe();
    recipe.title = req.body.title;
    recipe.cookingTime = req.body.cookingTime;
    recipe.servingSize = req.body.servingSize;
    recipe.status = 2; // 1: public
    recipe.ingredients = req.body.ingredients;
    recipe.preparation = req.body.preparation;
    recipe.imageUrl = req.body.imageUrl;
    try {
      queries.createRecipe(username, recipe);
      res.status(200).json({ message: 'Recipe saved.' });
    } catch {
      res.status(400).json({ message: 'An error ocurred while saving.' });
    }
  })
  //returns all recipes by user
  .get("/api/user/:username", async (req, res) => {

    var err = await checkRequest(req, res, false, true);
    if (err) return;

    var username = req.params.username;
    try {
      var recipes = await queries.getUserRecipes(username);
      res.status(200).send(recipes);
    } catch (err) {
      logger.error(err);
      res.status(400).json({ message: "Couldn't get recipes." });
    }
  })
  //Returns all public recipes (status 1)
  .get("/api/recipes", async (req, res) => {
    try {
      var recipes = await queries.getAllPublicRecipes();
      res.status(200).send(recipes);
    } catch (err) {
      logger.error(err);
      res.status(400).json({ message: "Couldn't get recipes." });
    }
  })
  //Gets single recipe by id
  .get("/api/recipe/:recipeId", async (req, res) => {
    var err = await checkRequest(req, res, false, true);
    if (err) return;

    var recipeId = req.params.recipeId;
    try {
      var recipe = await queries.getSingleRecipe(recipeId);
      res.status(200).json(JSON.parse(recipe));
    } catch (err) {
      logger.error(err);
      res.status(400).json({ message: "Couldn't get recipe." });
    }
  })
  //Posts comment on recipe
  .post("/api/recipe/:recipeId/comment", async (req, res) => {
    var err = await checkRequest(req, res, false, false);
    if (err) return;

    var recipeId = req.params.recipeId;
    if (req.body.text.length > 200) {
      res.status(400).json({ message: "Comment too long." });
      return;
    }
    try {
      await queries.postCommentOnRecipe(recipeId, req.headers.loggedinuser, req.body.text);
      res.status(200).json({ message: "Comment saved." });
    } catch (err) {
      logger.error(err);
      res.status(400).json({ message: "Error saving comment" });
    }
  })
  //Gets all comments on a recipe
  .get("/api/recipe/:recipeId/getComments", async (req, res) => {
    try {
      var comments = await queries.getCommentsForRecipe(req.params.recipeId);
      res.status(200).json(comments);
    } catch (err) {
      logger.error(err);
      res.status(400).json({ message: "Error getting comments" });
    }
  })
  //changes existing recipe 
  .post("/api/:username/:recipeId/edit", async (req, res) => {

    var err = await checkRequest(req, res, false, false);
    if (err) return;

    var recipe = new Recipe();
    recipe.id = req.params.recipeId;
    recipe.title = req.body.title;
    recipe.cookingTime = req.body.cookingTime;
    recipe.servingSize = req.body.servingSize;
    recipe.status = req.body.statusNumber;
    recipe.ingredients = req.body.ingredients;
    recipe.preparation = req.body.preparation;
    recipe.imageUrl = req.body.imageUrl;
    recipe.username = req.params.loggedinuser;

    try {
      queries.editRecipe(recipe);
      res.status(200).json({ message: "Recipe saved." });
    } catch (err) {
      logger.error(err);
      res.status(400).json({ message: "Couldn't edit recipe." });
    }
  })
  //changes Phonenumber of user
  .post("/api/:username/changePhoneNumber", async (req, res) => {

    var err = await checkRequest(req, res, false, false);
    if (err) return;

    var username = req.params.username;

    try {
      await queries.changePhoneNumber(username, req.body.newPhoneNumber, req.body.password);
      res.status(200).json({ message: "Phonenumber changed." });
    } catch (err) {
      logger.error(err);
      res.status(400).json({ message: "Couldn't change" });
    }
  })
  .get("/api/check/:username/UserExists", async (req, res) => {
    try {
      var exists = await queries.doesUserExist(req.params.username);
      res.status(200).json({ userExists: exists });
    } catch {
      res.status(400).json({ message: "Couldn't check." });
    }

  });

//admin
app.get("/api/admin/getAllPosts", async (req, res) => {

  var err = await checkRequest(req, res, true, false);
  if (err) return;

  try {
    var recipes = await queries.getAdminAllPosts();
    res.status(200).json(recipes);
  } catch (err) {
    logger.error(err);
    res.status(400).json({ message: "Couldn't get all posts." });
  }
})
  //checks if user is admin or not 
  .get("/api/admin/:username/isUserAdmin", async (req, res) => {

    var err = await checkRequest(req, res, false, true);
    if (err) return;

    try {
      var isAdmin = await queries.isUserAdmin(req.params.username);
      res.status(200).json({ isUserAdmin: isAdmin });
    } catch (err) {
      logger.error(err);
      res.status(400).json({ isUserAdmin: false });
    }
  });

//Help functions
async function checkRequest(req, res, hasToBeAdmin, isPublic) {
  var isAdmin;
  var headerJson = JSON.parse(JSON.stringify(req.headers));

  if (isPublic) {
    return false;
  }

  if (!headerJson.loggedinuser || !headerJson.authorization) {
    res.status(417).json({ message: "Wrong headers in request." });
    return true;
  }

  try {
    isAdmin = await queries.isUserAdmin(headerJson.loggedinuser);
  } catch {
    isAdmin = false;
  }

  if (hasToBeAdmin && !isAdmin) {
    logger.warn("User " + headerJson.loggedinuser + " tried to access the admin API without authorization");
    res.status(403).json({ message: "1) User unauthorized." });
    return true;
  }

  var splitAuthHeader = headerJson.authorization.split(" ");
  var cleanJwt = splitAuthHeader[1];
  var isUserAuthorized = await auth.checkJwt(headerJson.loggedinuser, cleanJwt);
  if (!isUserAuthorized) {
    logger.warn("User " + headerJson.loggedinuser + " tried to access the admin API without authorization");
    res.status(403).json({ message: "2) User unauthorized." });
    return true;
  }
}

async function isUserAllowedToEdit(recipeId, username) {
  var recipe = await queries.getSingleRecipe(recipeId);
  var userIsAdmin = await queries.isUserAdmin(username);
  if (userIsAdmin) return true;
  if (recipe.autor != username) {
    return false;
  }
  return true;
}

// set port, listen for requests
app.listen(3001, () => {
  console.log("Server is running on port 3001.");
  logger.info("Server is running on port 3001.");
});
