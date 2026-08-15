const pool = require('../db');

const loginUser = async (req, res) => {
  try {
    const { name, pin_code } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE name = $1 AND pin_code = $2",
      [name, pin_code]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials or PIN code" });
    }

    const user = result.rows[0];
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        role: user.role // 'admin' හෝ 'cashier'
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error during login" });
  }
};

module.exports = { loginUser };