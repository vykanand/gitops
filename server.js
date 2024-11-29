const express = require('express');
const axios = require('axios');

const app = express();
const SHEET_ID = '1oejo_52tgCkLdDeRDjjFywvmw4xA-s--m2dUZYYH3p8';

app.get('/', async (req, res) => {
  const emailToMove = req.query.email;
  
  if (!emailToMove) {
    return res.status(400).send('Email parameter is required');
  }

  // Direct access URL for the sheet
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

  try {
    // Fetch current data
    const response = await axios.get(sheetUrl);
    const rows = response.data.split('\n').map(row => row.split(','));
    
    // Find email and update directly via the edit URL
    const editUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
    
    // Using direct cell update format
    const updateResponse = await axios.post(editUrl, {
      range: 'A:B',
      values: rows.map(row => {
        if (row[0] === emailToMove) {
          return ['', emailToMove]; // Move to column B
        }
        return row;
      })
    });

    res.send(`Email ${emailToMove} moved successfully`);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

module.exports = (req, res);
