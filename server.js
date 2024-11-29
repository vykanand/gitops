const express = require('express');
const axios = require('axios');

const app = express();
const SHEET_ID = '1oejo_52tgCkLdDeRDjjFywvmw4xA-s--m2dUZYYH3p8';

app.get('/', async (req, res) => {
  const emailToRemove = req.query.email;
  res.send(emailToRemove)
  
  // if (!emailToRemove) {
  //   return res.status(400).send('Email parameter is required');
  // }

  // const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  // try {
  //   // Fetch current data
  //   const response = await axios.get(sheetUrl);
  //   const data = response.data.substring(47).slice(0, -2);
  //   const jsonData = JSON.parse(data);
    
  //   // Process and filter data
  //   const rows = jsonData.table.rows;
  //   const updatedRows = rows.filter(row => row.c[0].v !== emailToRemove);
    
  //   // Update sheet with filtered data
  //   const updateUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`;
  //   await axios.post(updateUrl, {
  //     data: updatedRows
  //   });

  //   res.send(`Email ${emailToRemove} removed successfully`);
  // } catch (error) {
  //   res.status(500).send(`Error: ${error.message}`);
  // }
});

module.exports = (req, res) => {
  app(req, res);
};