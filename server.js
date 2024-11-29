const express = require('express');
const axios = require('axios');

const app = express();
const SHEET_ID = '1oejo_52tgCkLdDeRDjjFywvmw4xA-s--m2dUZYYH3p8';

async function fetchFirstEntry(req, res) {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&range=A:A`;

  try {
    const response = await axios.get(sheetUrl);
    const firstEntry = response.data.split('\n')[0];
    res.status(200).send(`First entry: ${firstEntry}`);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

app.get('/', fetchFirstEntry);

module.exports = (req, res) => {
  app(req, res);
};
