const express = require('axios');
const axios = require('axios');

const app = express();
const SHEET_ID = '1oejo_52tgCkLdDeRDjjFywvmw4xA-s--m2dUZYYH3p8';

// Define the route handler
const handler = async (request, response) => {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&range=A:A`;

  try {
    const response = await axios.get(sheetUrl);
    const firstEntry = response.data.split('\n')[0];
    response.send(`First entry: ${firstEntry}`);
  } catch (error) {
    response.status(500).send(`Error: ${error.message}`);
  }
};

// Export the handler for Vercel
module.exports = handler;
