const express = require('express');
const axios = require('axios');

const app = express();
const SHEET_ID = '1oejo_52tgCkLdDeRDjjFywvmw4xA-s--m2dUZYYH3p8';

app.get('/', async (req, res) => {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&range=A:A`;

  try {
    const response = await axios.get(sheetUrl);
    const firstEntry = response.data.split('\n')[0];
    res.send(`First entry: ${firstEntry}`);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

module.exports = (req, res);
