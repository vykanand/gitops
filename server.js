const express = require('express');
const axios = require('axios');

const app = express();

const SHEET_ID = '1oejo_52tgCkLdDeRDjjFywvmw4xA-s--m2dUZYYH3p8';
const SHEET_NAME = 'Sheet1';
const API_KEY = 'AIzaSyDgeZ-JVfUuVouEoDv_FxlPfCuxz6LeVyw'; // Get this from Google Cloud Console - no auth needed

app.get('/', async (req, res) => {
  const emailToRemove = req.query.email;
  
  if (!emailToRemove) {
    return res.status(400).send('Email parameter is required');
  }

  const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:A?key=${API_KEY}`;

  try {
    const response = await axios.get(sheetUrl);
    const rows = response.data.values || [];
    const updatedRows = rows.filter(row => row[0] !== emailToRemove);

    // Update using the public endpoint
    await axios.put(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:A`, {
      values: updatedRows,
      valueInputOption: 'RAW'
    });

    res.send(`Email ${emailToRemove} removed successfully`);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

module.exports = (req, res) => {
  app(req, res);
};
