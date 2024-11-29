// Import the express module
const express = require('express');

// Create an Express app
const app = express();

// Set the port the server will listen on
const PORT = 3000;

// Define a simple route for the root path
app.get('/', (req, res) => {
  res.send('Hello, World! This is a Node.js Express server on port 3000.');
});

// Start the server and listen on port 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
