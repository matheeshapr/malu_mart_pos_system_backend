const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db.js');

const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('MaluMart API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});