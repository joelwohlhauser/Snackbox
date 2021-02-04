const mysql = require('mysql2/promise');
const User = require("../User");
const sha256 = require('js-sha256')

const con = mysql.createPool({
  host: '         your host ip        ',
  port: '         your post number    ',
  user: '         your username       ',
  password: '     your password       ',
  database: 'snackbox'
});

const createUser = (user) => {
  try {
    con.query('INSERT INTO user (id, username, password, phonenumber, isadmin)' +
      "VALUES (UNHEX(REPLACE(UUID(), '-','')), ?)", [
      [
        user.username,
        user.password,
        user.phonenumber,
        0
      ]
    ]
      , (error, results) => {
        if (error) {
          console.log(error)
          res.status(404, 'Could not add user')
        }
        res.status(201).send(`User added with ID: ${results}`)
      }
    )
  } catch (err) {
    console.log(err)
    res.status(404, err)
  }
}

const createGoogleUser = (user) => {
  try {
    con.query('INSERT INTO user (id, username, email, isadmin)' +
      "VALUES (UNHEX(REPLACE(UUID(), '-', '')), ?)", [
      [
        user.username,
        user.email,
        0
      ]
    ], (error, results) => {
      if (error) {
        res.status(404, 'Could not add user')
      }
      res.status(201).send(`User added with ID: ${results}`)
    })
  } catch (err) {
    res.status(404, err)
  }
}

const getUser = async (username) => {
  try {
    var rows = await con.execute('SELECT HEX(ID) AS id, username, password, phonenumber, isadmin, email FROM user WHERE username = ?', [username]);
    if (rows[0].length > 0) {
      var user = new User(rows[0][0].username, rows[0][0].password, rows[0][0].isadmin, rows[0][0].phonenumber, rows[0][0].email);
      user.id = rows[0][0].id;
      return user;
    } else {
      return;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const doesUserExist = async (username) => {
  var sql = "SELECT COUNT(1) AS count FROM user WHERE username = ?";
  try {
    var rows = await con.execute(sql, [username]);
    return rows[0][0].count == 1 ? true : false;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const createRecipe = async (username, recipe) => {
  var userId = await getUserIdByUsername(username);
  try {
    await con.query("INSERT INTO recipe (id, title, cookingtime, servingsize, status, ingredients, preparation, imageurl, user_id)"
      + " VALUES (UNHEX(REPLACE(UUID(), '-','')), ?, UNHEX(REPLACE(?, '-','')))", [
      [
        recipe.title,
        recipe.cookingTime,
        recipe.servingSize,
        recipe.status,
        recipe.ingredients,
        recipe.preparation,
        recipe.imageUrl,
      ],
      [userId]
    ]);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const getUserRecipes = async (username) => {
  try {
    var userId = await getUserIdByUsername(username);
    var sql = "SELECT HEX(id) AS id, title, cookingtime, servingsize, ingredients, preparation, imageurl, status AS statusNumber FROM recipe WHERE user_id = UNHEX(?) AND status != 3";
    var rows = await con.execute(sql, [userId]);
    return JSON.stringify(rows[0]);
  } catch (err) {
    console.log(err);
    throw (err);
  }
}

const getAllPublicRecipes = async () => {
  try {
    var sql = "SELECT HEX(r.id) AS id, r.title, r.cookingtime, r.servingsize, r.ingredients, r.preparation, r.imageurl, u.username AS autor FROM recipe r LEFT JOIN user u ON u.id = r.user_id WHERE r.status = 1";
    var rows = await con.execute(sql);
    return JSON.parse(JSON.stringify(rows[0]));
  } catch (err) {
    console.log(err);
    throw (err);
  }
}

const getSingleRecipe = async (recipeId) => {
  try {
    var sql = "SELECT HEX(r.id) AS id, r.title, r.cookingtime, r.servingsize, r.ingredients, r.preparation, r.imageurl, r.status AS statusNumber, u.username AS autor FROM recipe r LEFT JOIN user u ON u.id = r.user_id WHERE r.id = UNHEX(?)";
    var rows = await con.execute(sql, [recipeId]);
    return JSON.stringify(rows[0][0]);
  } catch (err) {
    console.log(err);
    throw (err);
  }
}

const editRecipe = async (recipe) => {
  var sql = "UPDATE recipe SET title = ?, cookingtime = ?, servingsize = ?, ingredients = ?, preparation = ?, imageurl = ?, status = ? WHERE id = UNHEX(?)"
  try {
    await con.query(sql, [
      recipe.title,
      recipe.cookingTime,
      recipe.servingSize,
      recipe.ingredients,
      recipe.preparation,
      recipe.imageUrl,
      recipe.status || 2,
      recipe.id
    ]);
  } catch (err) {
    console.log(err);
    throw (err);
  }
}

const getAdminAllPosts = async () => {
  try {
    var sql = "SELECT HEX(r.id) AS id, r.title, r.cookingtime, r.servingsize, r.ingredients, r.preparation, r.imageurl, r.status AS statusNumber, u.username FROM recipe r JOIN user u ON u.id = r.user_id";
    const rows = await con.execute(sql);
    console.log(rows[0]);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw (err);
  }
}

const postCommentOnRecipe = async (recipeId, username, text) => {
  var userId = await getUserIdByUsername(username);
  var sql = "INSERT INTO comment (id, user_id, `text`, recipe_id) VALUES (UNHEX(REPLACE(UUID(), '-','')), UNHEX(?), ?, (UNHEX(REPLACE(?, '-',''))))";
  try {
    con.query(sql, [[userId], [text], [recipeId]]);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const getCommentsForRecipe = async (recipeId) => {
  var sql = "SELECT text, user.username FROM comment JOIN user ON user.id = comment.user_id WHERE recipe_id = UNHEX(REPLACE(?, '-',''))";
  try {
    var comments = await con.execute(sql, [recipeId]);
    console.log(comments[0]);
    return comments[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const changePhoneNumber = async (username, newPhonenumber, password) => {
  var user = await getUser(username);
  if (user.password !== sha256(password) || user.email) {
    throw new Error("Passwords do not match");
  }
  var userId = await getUserIdByUsername(username);
  var sql = "UPDATE user SET phonenumber = ? WHERE id = UNHEX(?)";
  try {
    await con.execute(sql, [newPhonenumber, userId]);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Hilfsmethoden
const getUserIdByUsername = async (username) => {
  try {
    var sql = "SELECT HEX(id) AS id FROM user WHERE username = ?";
    const rows = await con.execute(sql, [username]);
    return rows[0][0].id;
  } catch (err) {
    console.log(err);
    throw (err);
  }
}

const isUserAdmin = async (username) => {
  try {
    var isAdmin = 0;
    var sql = "SELECT isadmin from user where username = ?";
    const rows = await con.execute(sql, [username]);
    isAdmin = rows[0][0].isadmin;
    return isAdmin > 0 ? true : false;
  } catch (err) {
    console.log("Error at isUserAdmin: " + username);
    throw (err);
  }
}

module.exports = {
  createUser,
  createGoogleUser,
  getUser,
  createRecipe,
  getUserRecipes,
  getAllPublicRecipes,
  getSingleRecipe,
  editRecipe,
  getAdminAllPosts,
  isUserAdmin,
  postCommentOnRecipe,
  getCommentsForRecipe,
  changePhoneNumber,
  getUserIdByUsername,
  doesUserExist
}