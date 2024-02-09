const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      // Assuming 'users' is an array where user data is stored
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user. Username and password are required." });
});



// Get the book list available in the shop - Task 1
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4));
 // return res.status(300).json({message: "Yet to be implemented"});
});


// Get book details based on ISBN-Task 2
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    // Check if the book with the given ISBN exists
    if (books[isbn]) {
      // If the book exists, send its details
      res.status(200).json({ book: books[isbn] });
    } else {
      // If the book with the given ISBN is not found, send a 404 status
      res.status(404).json({ message: "Book not found" });
    }
  });


  
  // Get book details based on author-Task 3
  public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
  
    // Check if any book has the specified author
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
  
    if (booksByAuthor.length > 0) {
      // If books by the author exist, send their details
      res.status(200).json({ books: booksByAuthor });
    } else {
      // If no books by the author are found, send a 404 status
      res.status(404).json({ message: "Books by the author not found" });
    }
  });


  
  // Get all books based on title-Task 4
  public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
  
    // Check if any book has the specified title
    const booksByTitle = Object.values(books).filter(book => book.title === title);
  
    if (booksByTitle.length > 0) {
      // If books with the title exist, send their details
      res.status(200).json({ books: booksByTitle });
    } else {
      // If no books with the title are found, send a 404 status
      res.status(404).json({ message: "Books with the title not found" });
    }
  });
  


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    try {
      const isbn = req.params.isbn;
  
      // Check if the book with the given ISBN exists
      if (books[isbn]) {
        // Check if the book has reviews
        const bookReviews = books[isbn].reviews;
  
        if (Object.keys(bookReviews).length > 0) {
          // If there are reviews, send them as the response
          res.status(200).json({ reviews: bookReviews });
        } else {
          // If there are no reviews, send a message
          res.status(404).json({ message: "No reviews available for the book" });
        }
      } else {
        // If the book with the given ISBN is not found, send a 404 status
        res.status(404).json({ message: "Book not found" });
      }
    } catch (error) {
      // If an error occurs, send an error response
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports.general = public_users;
