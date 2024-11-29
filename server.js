const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const APPROVED_EMAILS = 'approved.txt';
const BANNED_EMAILS = 'banned.txt';

// Create files if they don't exist
[APPROVED_EMAILS, BANNED_EMAILS].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '');
  }
});

// Serve static HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoints
app.get('/api/emails', (req, res) => {
  const approved = fs.readFileSync(APPROVED_EMAILS, 'utf8').split('\n').filter(Boolean);
  const banned = fs.readFileSync(BANNED_EMAILS, 'utf8').split('\n').filter(Boolean);
  res.json({ approved, banned });
});

app.get('/api/move', (req, res) => {
  const { email, to } = req.query;
  const fromFile = to === 'banned' ? APPROVED_EMAILS : BANNED_EMAILS;
  const toFile = to === 'banned' ? BANNED_EMAILS : APPROVED_EMAILS;

  let fromEmails = fs.readFileSync(fromFile, 'utf8').split('\n').filter(Boolean);
  let toEmails = fs.readFileSync(toFile, 'utf8').split('\n').filter(Boolean);

  fromEmails = fromEmails.filter(e => e !== email);
  if (!toEmails.includes(email)) {
    toEmails.push(email);
  }

  fs.writeFileSync(fromFile, fromEmails.join('\n'));
  fs.writeFileSync(toFile, toEmails.join('\n'));

  res.json({ message: `Email ${email} moved to ${to} list` });
});

module.exports = app;

if (require.main === module) {
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}
