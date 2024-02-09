const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

// Use regd_users router for the login route
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    try {
        // Get ISBN from the request parameters
        const isbn = req.params.isbn;

        // Get review text from the request query
        const reviewText = req.query.review;

        // Get the username from the session
        const username = req.session.authorization ? req.session.authorization.username : null;

        if (!isbn || !reviewText || !username) {
            return res.status(400).json({ message: "Invalid request. ISBN, review, and username are required." });
        }

        // Check if the book with the given ISBN exists
        if (books[isbn]) {
            // Check if the user has already posted a review for the same ISBN
            const existingReview = findReviewByUsername(isbn, username);

            if (existingReview) {
                // If the user has already posted a review, update the existing review
                existingReview.review = reviewText;
            } else {
                // If the user hasn't posted a review, add a new review
                if (!books[isbn].reviews) {
                    books[isbn].reviews = [];
                }
                books[isbn].reviews.push({ username, review: reviewText });
            }

            return res.status(200).json({ message: "Review added/modified successfully." });
        } else {
            // If the book with the given ISBN is not found, send a 404 status
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        // If an error occurs, send an error response
        return res.status(500).json({ error: error.message });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
