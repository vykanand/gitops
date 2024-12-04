// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const cors = require('cors');
// const app = express();

// // Enable CORS
// app.use(cors());
// app.use(express.json());

// // Use Railway's PORT environment variable
// const PORT = process.env.PORT || 3000;

// // Update file path for Railway
// const EMAILS_STATE_FILE = path.join(__dirname, 'email_state.json');

// // Ensure the state file exists with correct structure
// const initializeStateFile = async () => {
//   try {
//     if (!fs.existsSync(EMAILS_STATE_FILE)) {
//       await fs.promises.writeFile(EMAILS_STATE_FILE, JSON.stringify({ approved: [], banned: [], unbanned: [] }));
//     }
//   } catch (error) {
//     console.error('Error initializing state file:', error);
//   }
// };

// // Initialize state file (to handle the case if it's missing during the first run)
// initializeStateFile();

// // Serve static files (for front-end)
// app.use(express.static(path.join(__dirname, 'public')));

// // Get all emails in all lists (approved, banned, unbanned)
// app.get('/api/emails', async (req, res) => {
//   try {
//     const emailState = JSON.parse(await fs.promises.readFile(EMAILS_STATE_FILE, 'utf8'));
//     res.json(emailState);
//   } catch (error) {
//     console.error('Error reading email state:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// // Move email between lists
// app.get('/api/move', async (req, res) => {
//   try {
//     const { email, state } = req.query;

//     // Validate email and state parameters
//     if (!email || !state || !['approved', 'banned', 'unbanned'].includes(state)) {
//       return res.status(400).json({ message: 'Invalid email or state' });
//     }

//     const emailState = JSON.parse(await fs.promises.readFile(EMAILS_STATE_FILE, 'utf-8'));

//     let fromList, toList;

//     // Determine the source list based on current state of email
//     if (emailState.approved.includes(email)) {
//       fromList = 'approved';
//     } else if (emailState.banned.includes(email)) {
//       fromList = 'banned';
//     } else if (emailState.unbanned.includes(email)) {
//       fromList = 'unbanned';
//     } else {
//       return res.status(400).json({ message: 'Email not found in any state' });
//     }

//     // Check if the state is valid and decide where to move the email
//     toList = state;

//     // Ensure the email isn't already in the target state
//     if (fromList === toList) {
//       return res.status(400).json({ message: 'Email is already in the target state' });
//     }

//     // Remove email from the current state
//     emailState[fromList] = emailState[fromList].filter(e => e !== email);

//     // Add email to the target state
//     emailState[toList].push(email);

//     // Save the updated email state to the file
//     await fs.promises.writeFile(EMAILS_STATE_FILE, JSON.stringify(emailState, null, 2));

//     res.json({ message: `Email ${email} moved to ${state} state` });
//   } catch (error) {
//     console.error('Error processing the move request:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// // Add email to a specific list (approved, banned, unbanned)
// app.get('/api/add-email', async (req, res) => {
//   const { email, list } = req.query;

//   if (!email || !list || !['approved', 'banned', 'unbanned'].includes(list)) {
//     return res.status(400).json({ message: 'Invalid email or list' });
//   }

//   try {
//     const emailState = JSON.parse(await fs.promises.readFile(EMAILS_STATE_FILE, 'utf8'));

//     // Check if email already exists in the list
//     if (emailState[list].includes(email)) {
//       return res.status(400).json({ message: `${email} already exists in the ${list} list` });
//     }

//     // Add the email to the appropriate list
//     emailState[list].push(email);

//     // Save the updated email state
//     await fs.promises.writeFile(EMAILS_STATE_FILE, JSON.stringify(emailState, null, 2));

//     res.json({ message: `${email} added to ${list} list` });
//   } catch (error) {
//     console.error('Error adding email:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// // Serve the main HTML page (use a public folder to serve your frontend)
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;




const express = require('express');
const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

// A simple API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, Railway!' });
});

// Root route serving the HTML page
app.get('/', (req, res) => {
  res.send('vkvik');
});

// Start the server on port from environment or 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
