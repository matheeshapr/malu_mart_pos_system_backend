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

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Cannot delete. Products might be linked to this category." });
  }
};

module.exports = {
    createCategory,
    getCategories,
    deleteCategory
};