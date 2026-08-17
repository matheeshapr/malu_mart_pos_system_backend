const pool = require('../db');

const registerCustomer = async (req, res) => {
  try {
    const { name, phone, nic, address, password } = req.body; // address එක මෙහි ලබා ගැනීම

    const existing = await pool.query(
      "SELECT * FROM customers WHERE phone = $1 OR nic = $2",
      [phone, nic]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Phone number or NIC already registered!" });
    }

    // Database එකට address එක ඇතුළත් කිරීම සහ returning වලට address එක එකතු කිරීම
    const newCustomer = await pool.query(
      "INSERT INTO customers (name, phone, nic, address, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, nic, address",
      [name, phone, nic, address, password]
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

    if (customer.password !== password) {
      return res.status(401).json({ error: "Invalid password!" });
    }

    res.status(200).json({
      message: "Login successful",
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        nic: customer.nic,
        address: customer.address
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

const getCustomerOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM sales WHERE customer_id = $1 ORDER BY id DESC",
      [id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

// Staff Login
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
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error during login" });
  }
};

// සියල්ලම එකම තැනක හරියට Export කිරීම
module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomers,
  loginUser,
  getCustomerOrders
};