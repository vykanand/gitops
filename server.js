const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Define the file for storing email states
const EMAILS_STATE_FILE = 'email_state.json';

// Ensure the state file exists with correct structure
if (!fs.existsSync(EMAILS_STATE_FILE)) {
  fs.writeFileSync(EMAILS_STATE_FILE, JSON.stringify({ approved: [], banned: [], unbanned: [] }));
}

app.use(express.static(path.join(__dirname, 'public')));  // Serve static files

// Get all emails in all lists (approved, banned, unbanned)
app.get('/api/emails', (req, res) => {
  const emailState = JSON.parse(fs.readFileSync(EMAILS_STATE_FILE, 'utf8'));
  res.json(emailState);
});

// Move email between lists
app.get('/api/move', (req, res) => {
  try {
      const { email, state } = req.query;

      // Validate email and state parameters
      if (!email || !state || !['approved', 'banned', 'unbanned'].includes(state)) {
          return res.status(400).json({ message: 'Invalid email or state' });
      }

      const emailState = JSON.parse(fs.readFileSync('email_state.json', 'utf-8'));

      let fromList, toList;

      // Determine the source list based on current state of email
      if (emailState.approved.includes(email)) {
          fromList = 'approved';
      } else if (emailState.banned.includes(email)) {
          fromList = 'banned';
      } else if (emailState.unbanned.includes(email)) {
          fromList = 'unbanned';
      } else {
          return res.status(400).json({ message: 'Email not found in any state' });
      }

      // Check if the state is valid and decide where to move the email
      toList = state;

      // Ensure the email isn't already in the target state
      if (fromList === toList) {
          return res.status(400).json({ message: 'Email is already in the target state' });
      }

      // Remove email from the current state
      emailState[fromList] = emailState[fromList].filter(e => e !== email);

      // Add email to the target state
      emailState[toList].push(email);

      // Save the updated email state to the file
      fs.writeFileSync('email_state.json', JSON.stringify(emailState, null, 2));

      res.json({ message: `Email ${email} moved to ${state} state` });
  } catch (error) {
      console.error('Error processing the move request:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Add email to a specific list (approved, banned, unbanned)
app.get('/api/add-email', (req, res) => {
  const { email, list } = req.query;

  if (!email || !list || !['approved', 'banned', 'unbanned'].includes(list)) {
    return res.status(400).json({ message: 'Invalid email or list' });
  }

  const emailState = JSON.parse(fs.readFileSync(EMAILS_STATE_FILE, 'utf8'));

  // Check if email already exists in the list
  if (emailState[list].includes(email)) {
    return res.status(400).json({ message: `${email} already exists in the ${list} list` });
  }

  // Add the email to the appropriate list
  emailState[list].push(email);

  // Save the updated email state
  fs.writeFileSync(EMAILS_STATE_FILE, JSON.stringify(emailState, null, 2));

  res.json({ message: `${email} added to ${list} list` });
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
if (require.main === module) {
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

module.exports = app;
