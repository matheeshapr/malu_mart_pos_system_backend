const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db.js');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

// Add these two lines for Products
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const saleRoutes = require('./routes/saleRoutes');
app.use('/api/sales', saleRoutes);



// Test Route
app.get('/', (req, res) => {
    res.send('MaluMart API is running...');

});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

