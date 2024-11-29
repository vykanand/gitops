const express = require('express');
const axios = require('axios');

const app = express();
const SHEET_ID = '1oejo_52tgCkLdDeRDjjFywvmw4xA-s--m2dUZYYH3p8';

async function removeEmail(req, res) {
  const emailToRemove = req.query.email;
  
  if (!emailToRemove) {
    return res.status(400).send('Email parameter is required');
  }

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&range=A:A`;

  try {
    const response = await axios.get(sheetUrl);
    const rows = response.data.split('\n');
    const foundIndex = rows.findIndex(email => email.trim() === emailToRemove);
    
    if (foundIndex !== -1) {
      // Found the email, now remove it
      rows.splice(foundIndex, 1);
      
      // Update the sheet with the new data
      const updateUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`;
      await axios.post(updateUrl, {
        range: 'A:A',
        values: rows.map(email => [email])
      });
      
      res.status(200).send(`Email ${emailToRemove} removed successfully`);
    } else {
      res.status(404).send(`Email ${emailToRemove} not found`);
    }
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

app.get('/', removeEmail);

module.exports = (req, res) => {
  app(req, res);
};
