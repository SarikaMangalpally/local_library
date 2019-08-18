var Genre = require("../models/genre");
var Book = require("../models/book");
var validator = require("express-validator");
var async = require("async");
// Display list of all Genre.
function genre_list(req, res) {
  Genre.find()
    .sort([["name", "ascending"]])
    .exec((err, genre_list) => {
      if (err) {
        return err;
      } else {
        // console.log(genre_list);
        res.render("genre_list", {
          title: "Genre List",
          genre_list: genre_list
        });
      }
    });
  //res.send("NOT IMPLEMENTED: Genre list");
}

// Display detail page for a specific Genre.
function genre_detail(req, res) {
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books: function(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        var err = new Error("Genre not found");
        err.status = 404;
        return err;
      }
      // Successful, so render.
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books
      });
    }
  );
}

// Display Genre create form on GET.
function genre_create_get(req, res) {
  res.render("genre_form", { title: "Create Genre" });
}

// Handle Genre create on POST.
var genre_create_post = [
  validator
    .body("name", "genre name required")
    .isLength({ min: 1 })
    .trim(),
  validator.sanitizeBody("name").escape(),
  // Extract the validation errors from a request.
  (req, res, next) => {
    const errors = validator.validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array()
      });
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec(function(err, found_genre) {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save(function(err) {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  }
];

// Display Genre delete form on GET.
function genre_delete_get(req, res, next) {
  async.parallel(
    {
      genre: callback => {
        Genre.findById(req.params.id).exec(callback);
      },
      genrebooks: callback => {
        Book.find({ genre: req.params.id }).exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == -null) {
        res.redirect("/catalog/genres");
      }
      res.render("genre_delete", {
        title: "Delete Genre",
        genre: results.genre,
        genrebooks: results.genrebooks
      });
    }
  );
}

// Handle Genre delete on POST.
function genre_delete_post(req, res) {
  async.parallel(
    {
      genre: callback => {
        Genre.findById(req.params.id).exec(callback);
      },
      genrebooks: callback => {
        Book.findById({ genre: req.params.id }).exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genrebooks.length > 0) {
        res.render("genre_delete", {
          title: "Delete genre",
          genre: results.genre,
          genrebooks: results.genrebooks
        });
        return;
      }
      Genre.findByIdAndRemove(req.params.id, err => {
        if (err) {
          return next(err);
        }
        res.redirect("/catalog/genres");
      });
    }
  );
}

// Display Genre update form on GET.
function genre_update_get(req, res) {
  Genre.findById(req.params.id, function(err, genre) {
    if (err) {
      return next(err);
    }
    if (genre == null) {
      // No results.
      var err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("genre_form", { title: "Update Genre", genre: genre });
  });
}

// Handle Genre update on POST.
function genre_update_post(req, res) {
  // Validate that the name field is not empty.
  validator
    .body("name", "Genre name required")
    .isLength({ min: 1 })
    .trim();

  // Sanitize (escape) the name field.
  validator.sanitizeBody("name").escape();

  // Process request after validation and sanitization.

  // Extract the validation errors from a request .
  const errors = validationResult(req);

  // Create a genre object with escaped and trimmed data (and the old id!)
  var genre = new Genre({
    name: req.body.name,
    _id: req.params.id
  });

  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values and error messages.
    res.render("genre_form", {
      title: "Update Genre",
      genre: genre,
      errors: errors.array()
    });
    return;
  } else {
    // Data from form is valid. Update the record.
    Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err, thegenre) {
      if (err) {
        return next(err);
      }
      // Successful - redirect to genre detail page.
      res.redirect(thegenre.url);
    });
  }
}
module.exports = {
  genre_update_post,
  genre_update_get,
  genre_delete_post,
  genre_delete_get,
  genre_create_post,
  genre_create_get,
  genre_detail,
  genre_list
};
