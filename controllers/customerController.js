const pool = require('../db');

// පාරිභෝගික ලියාපදිංචිය (Register)
const registerCustomer = async (req, res) => {
  try {
    const { name, phone, nic, password } = req.body;

    // දුරකථන අංකය හෝ NIC එක දැනටමත් පවතීදැයි පරීක්ෂා කිරීම
    const existing = await pool.query(
      "SELECT * FROM customers WHERE phone = $1 OR nic = $2",
      [phone, nic]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Phone number or NIC already registered!" });
    }

    const newCustomer = await pool.query(
      "INSERT INTO customers (name, phone, nic, password) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, nic",
      [name, phone, nic, password]
    );

    res.status(201).json({ message: "Registration successful!", customer: newCustomer.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

// පාරිභෝගික ලොග් වීම (Login)
const loginCustomer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM customers WHERE phone = $1",
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found with this phone number!" });
    }

    const customer = result.rows[0];

    // මුරපදය සමාන දැයි බැලීම
    if (customer.password !== password) {
      return res.status(401).json({ error: "Invalid password!" });
    }

    res.status(200).json({
      message: "Login successful",
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        nic: customer.nic
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

// සියලුම පාරිභෝගිකයින් ලබා ගැනීම
const getCustomers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, phone, nic, address, credit_balance, created_at FROM customers ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomers
};