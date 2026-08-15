const pool = require('../db');

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = await pool.query(
            "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
            [name, description]
        );
        res.status(201).json(newCategory.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

const getCategories = async (req, res) => {
    try {
        const allCategories = await pool.query("SELECT * FROM categories ORDER BY id ASC");
        res.status(200).json(allCategories.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = {
    createCategory,
    getCategories
};