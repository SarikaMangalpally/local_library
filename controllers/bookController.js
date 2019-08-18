var Book = require("../models/book");
var Author = require("../models/author");
var Genre = require("../models/genre");
var BookInstance = require("../models/bookinstance");

const validator /*{ body, validationResult }*/ = require("express-validator");
const { sanitizeBody } = require("express-validator");

var async = require("async");

function index(req, res) {
  async.parallel(
    {
      book_count: function(callback) {
        Book.countDocuments({}, callback);
      },
      book_instance_count: function(callback) {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count: function(callback) {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
      author_count: function(callback) {
        Author.countDocuments({}, callback);
      },
      genre_count: function(callback) {
        Genre.countDocuments({}, callback);
      }
    },
    function(err, results) {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results
      });
    }
  );
}

// Display list of all books.
function book_list(req, res) {
  Book.find({}, "title author ")
    .populate("author")
    .exec(function(err, list_books) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("book_list", { title: "Book List", book_list: list_books });
    });
}

// Display detail page for a specific book.
function book_detail(req, res) {
  async.parallel(
    {
      book: function(callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      book_instance: function(callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      console.log(results.book.genre);
      res.render("book_detail", {
        title: results.book.title,
        book: results.book,
        book_instances: results.book_instance
      });
    }
  );
}

// Display book create form on GET.
function book_create_get(req, res) {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      authors: function(callback) {
        Author.find(callback);
      },
      genres: function(callback) {
        Genre.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      res.render("book_form", {
        title: "Create Book",
        authors: results.authors,
        genres: results.genres
      });
    }
  );
}

// Handle book create on POST.
function book_create_post(req, res) {
  if (!(req.body.genre instanceof Array)) {
    if (typeof req.body.genre === "undefined") req.body.genre = [];
    else req.body.genre = new Array(req.body.genre);
  }
  next();

  // Validate fields.
  validator
    .body("title", "Title must not be empty.")
    .isLength({ min: 1 })
    .trim();
  validator
    .body("author", "Author must not be empty.")
    .isLength({ min: 1 })
    .trim();
  validator
    .body("summary", "Summary must not be empty.")
    .isLength({ min: 1 })
    .trim();
  validator
    .body("isbn", "ISBN must not be empty")
    .isLength({ min: 1 })
    .trim();
  // Sanitize fields (using wildcard).
  validator.sanitizeBody("*").escape();

  // Process request after validation and sanitization.

  // Extract the validation errors from a request.
  const errors = validationResult(req);

  // Create a Book object with escaped and trimmed data.
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: req.body.genre
  });

  if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/error messages.

    // Get all authors and genres for form.
    async.parallel(
      {
        authors: function(callback) {
          Author.find(callback);
        },
        genres: function(callback) {
          Genre.find(callback);
        }
      },
      function(err, results) {
        if (err) {
          return next(err);
        }

        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = "true";
          }
        }
        res.render("book_form", {
          title: "Create Book",
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        });
      }
    );
    return;
  } else {
    // Data from form is valid. Save book.
    book.save(function(err) {
      if (err) {
        return next(err);
      }
      //successful - redirect to new book record.
      res.redirect(book.url);
    });
  }
}

// Display book delete form on GET.
function book_delete_get(req, res) {
  async.parallel(
    {
      book: callback => {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      book_instance: callback => {
        BookInstance.find({ book: req.params.id }).exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("book_delete", {
        title: "Delete Book",
        book: results.book,
        book_instance: results.book_instance
      });
    }
  );
  // res.send("NOT IMPLEMENTED: Book delete GET");
}

// Handle book delete on POST.
function book_delete_post(req, res) {
  sync.parallel(
    {
      book: callback => {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      book_instance: callback => {
        BookInstance.find({ book: req.params.id }).exec(callback);
      }
    },
    err => {
      if (err) {
        return err;
      } else {
        Book.findByIdAndRemove(req.params.id, err => {
          if (err) {
            return next(err);
          } else {
            res.redirect("/catalog/books");
          }
        });
      }
    }
  );
  //res.send("NOT IMPLEMENTED: Book delete POST");
}

// Display book update form on GET.
function book_update_get(req, res) {
  async.parallel(
    {
      book: function(callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      authors: function(callback) {
        Author.find(callback);
      },
      genres: function(callback) {
        Genre.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (
        var all_g_iter = 0;
        all_g_iter < results.genres.length;
        all_g_iter++
      ) {
        for (
          var book_g_iter = 0;
          book_g_iter < results.book.genre.length;
          book_g_iter++
        ) {
          if (
            results.genres[all_g_iter]._id.toString() ==
            results.book.genre[book_g_iter]._id.toString()
          ) {
            results.genres[all_g_iter].checked = "true";
          }
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: results.authors,
        genres: results.genres,
        book: results.book
      });
    }
  );
}

// Handle book update on POST.
function book_update_post(req, res) {
  if (!(req.body.genre instanceof Array)) {
    if (typeof req.body.genre === "undefined") req.body.genre = [];
    else req.body.genre = new Array(req.body.genre);
  }
  validator
    .body("title", "Title must not be empty.")
    .isLength({ min: 1 })
    .trim();
  validator
    .body("author", "Author must not be empty.")
    .isLength({ min: 1 })
    .trim();
  validator
    .body("summary", "Summary must not be empty.")
    .isLength({ min: 1 })
    .trim();
  validator
    .body("isbn", "ISBN must not be empty")
    .isLength({ min: 1 })
    .trim();
  // Sanitize fields.
  validator.sanitizeBody("title").escape();
  validatpr.sanitizeBody("author").escape();
  validator.sanitizeBody("summary").escape();
  validator.sanitizeBody("isbn").escape();
  validator.sanitizeBody("genre.*").escape();
  // Process request after validation and sanitization.
  // Extract the validation errors from a request.
  const errors = validationResult(req);

  // Create a Book object with escaped/trimmed data and old id.
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
    _id: req.params.id //This is required, or a new ID will be assigned!
  });

  if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/error messages.

    // Get all authors and genres for form.
    async.parallel(
      {
        authors: function(callback) {
          Author.find(callback);
        },
        genres: function(callback) {
          Genre.find(callback);
        }
      },
      function(err, results) {
        if (err) {
          return next(err);
        }

        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = "true";
          }
        }
        res.render("book_form", {
          title: "Update Book",
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        });
      }
    );
    return;
  } else {
    // Data from form is valid. Update the record.
    Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
      if (err) {
        return next(err);
      }
      // Successful - redirect to book detail page.
      res.redirect(thebook.url);
    });
  }
}

module.exports = {
  index,
  book_create_get,
  book_create_post,
  book_delete_get,
  book_delete_post,
  book_update_get,
  book_update_post,
  book_detail,
  book_list
};
