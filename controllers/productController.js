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

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, is_weighed, plu_code, barcode, cost_price, selling_price, stock_quantity, low_stock_alert } = req.body;

        const updateQuery = `
      UPDATE products 
      SET category_id=$1, name=$2, is_weighed=$3, plu_code=$4, barcode=$5, cost_price=$6, selling_price=$7, stock_quantity=$8, low_stock_alert=$9 
      WHERE id=$10 RETURNING *
    `;

        const result = await pool.query(updateQuery, [category_id, name, is_weighed, plu_code, barcode, cost_price, selling_price, stock_quantity, low_stock_alert, id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server Error" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM products WHERE id=$1 RETURNING *", [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
};