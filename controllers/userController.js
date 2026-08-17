const pool = require('../db');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, role, pin_code, phone, is_active, created_at FROM users ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, role, pin_code, phone } = req.body;
    if (!name || !pin_code) {
      return res.status(400).json({ error: "Name and PIN code are required" });
    }

    const newUser = await pool.query(
      "INSERT INTO users (name, role, pin_code, phone, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, name, role, pin_code, phone, is_active",
      [name, role || 'cashier', pin_code, phone || '']
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser
};