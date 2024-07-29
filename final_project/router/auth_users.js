const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let existingusers = users.filter((user) => {
        return user.username === username;
    });

    if (existingusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });

    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password){
    return res.status(400).json({message: "Username and Password are required"});
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({data:password}, 'access', {expiresIn:60 * 60});

    req.session.authorization = {accessToken, username};

    return res.status(200).send({message: "User successfully logged in"});
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  console.log(req.body);
  if(!review) {
    return res.status(400).json({message: "Review is required"});
  }
  const book = books[isbn];
  if (book) {
    book.reviews[req.user.username] = review;
    return res.status(200).json({message: "Review added successfully"});
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return req.status(404).json({message: "Book not found"});
    }

    if (book.reviews[req.user.username]) {
        delete book.reviews[req.user.username];
        return res.status(200).json({message: "Review deleted successfully"});
    } else {
        return res.status(404).json({message: "Review not found for this user"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
