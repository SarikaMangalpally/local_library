var express = require("express");
var router = express.Router();
const {
  index,
  book_create_get,
  book_create_post,
  book_delete_get,
  book_delete_post,
  book_update_get,
  book_update_post,
  book_detail,
  book_list
} = require("../controllers/bookController");

// Require controller modules.
//var book_controller = require("../controllers/bookController");
const {
  author_update_post,
  author_update_get,
  author_delete_post,
  author_delete_get,
  author_create_post,
  author_create_get,
  author_detail,
  author_list
} = require("../controllers/authorController");
const {
  genre_update_post,
  genre_update_get,
  genre_delete_post,
  genre_delete_get,
  genre_create_post,
  genre_create_get,
  genre_detail,
  genre_list
} = require("../controllers/genreController");
const {
  bookinstance_list,
  bookinstance_detail,
  bookinstance_create_get,
  bookinstance_create_post,
  bookinstance_delete_get,
  bookinstance_delete_post,
  bookinstance_update_get,
  bookinstance_update_post
} = require("../controllers/bookinstanceController");

/// BOOK ROUTES ///

// GET catalog home page.
router.get("/", index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get("/book/create", book_create_get);

// POST request for creating Book.
router.post("/book/create", book_create_post);

// GET request to delete Book.
router.get("/book/:id/delete", book_delete_get);

// POST request to delete Book.
router.post("/book/:id/delete", book_delete_post);

// GET request to update Book.
router.get("/book/:id/update", book_update_get);

// POST request to update Book.
router.post("/book/:id/update", book_update_post);

// GET request for one Book.
router.get("/book/:id", book_detail);

// GET request for list of all Book items.
router.get("/books", book_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get("/author/create", author_create_get);

// POST request for creating Author.
router.post("/author/create", author_create_post);

// GET request to delete Author.
router.get("/author/:id/delete", author_delete_get);

// POST request to delete Author.
router.post("/author/:id/delete", author_delete_post);

// GET request to update Author.
router.get("/author/:id/update", author_update_get);

// POST request to update Author.
router.post("/author/:id/update", author_update_post);

// GET request for one Author.
router.get("/author/:id", author_detail);

// GET request for list of all Authors.
router.get("/authors", author_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get("/genre/create", genre_create_get);

//POST request for creating Genre.
router.post("/genre/create", genre_create_post);

// GET request to delete Genre.
router.get("/genre/:id/delete", genre_delete_get);

// POST request to delete Genre.
router.post("/genre/:id/delete", genre_delete_post);

// GET request to update Genre.
router.get("/genre/:id/update", genre_update_get);

// POST request to update Genre.
router.post("/genre/:id/update", genre_update_post);

// GET request for one Genre.
router.get("/genre/:id", genre_detail);

// GET request for list of all Genre.
router.get("/genres", genre_list);

/// BOOKINSTANCE ROUTES ///

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
router.get("/bookinstance/create", bookinstance_create_get);

// POST request for creating BookInstance.
router.post("/bookinstance/create", bookinstance_create_post);

// GET request to delete BookInstance.
router.get("/bookinstance/:id/delete", bookinstance_delete_get);

// POST request to delete BookInstance.
router.post("/bookinstance/:id/delete", bookinstance_delete_post);

// GET request to update BookInstance.
router.get("/bookinstance/:id/update", bookinstance_update_get);

// POST request to update BookInstance.
router.post("/bookinstance/:id/update", bookinstance_update_post);

// GET request for one BookInstance.
router.get("/bookinstance/:id", bookinstance_detail);

// GET request for list of all BookInstance.
router.get("/bookinstances", bookinstance_list);

module.exports = router;
