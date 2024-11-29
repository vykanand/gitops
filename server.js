const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const APPROVED_EMAILS = 'approved.txt';
const BANNED_EMAILS = 'banned.txt';

[APPROVED_EMAILS, BANNED_EMAILS].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

  // Remove from both lists to prevent duplicates
  fromEmails = fromEmails.filter(e => e !== email);
  toEmails = toEmails.filter(e => e !== email);
  
  // Add to target list
  toEmails.push(email);

  // Save unique emails only
  fs.writeFileSync(fromFile, [...new Set(fromEmails)].join('\n'));
  fs.writeFileSync(toFile, [...new Set(toEmails)].join('\n'));

  res.json({ message: `Email ${email} moved to ${to} list` });
});

module.exports = app;

if (require.main === module) {
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}
