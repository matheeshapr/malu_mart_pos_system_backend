const pool = require('../db');

// Create a new product
const createProduct = async (req, res) => {
    try {
        const {
            category_id, 
            name, 
            is_weighed, 
            plu_code, 
            barcode, 
            cost_price, 
            selling_price, 
            stock_quantity, 
            low_stock_alert
        } = req.body;

        const newProduct = await pool.query(
            `INSERT INTO products 
            (category_id, name, is_weighed, plu_code, barcode, cost_price, selling_price, stock_quantity, low_stock_alert) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [category_id, name, is_weighed, plu_code, barcode, cost_price, selling_price, stock_quantity, low_stock_alert]
        );

        res.status(201).json(newProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

// Get all products (with their category names)
const getProducts = async (req, res) => {
    try {
        const allProducts = await pool.query(
            `SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id ASC`
        );
        res.status(200).json(allProducts.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = {
    createProduct,
    getProducts
};