// Import the express module
const express = require('express');

// Create an Express app
const app = express();

// Define a simple route for the root path
app.get('/', (req, res) => {
  res.send('Hello, World! This is a Node.js Express server running on Vercel.');
});

// Define the Vercel handler
module.exports = (req, res) => {
  app(req, res);
};
