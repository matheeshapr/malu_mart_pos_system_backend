const pool = require('../db');



const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { customer_id, items, total_amount, payment_method } = req.body;

    // 1. Orders table එකට දාන්න
    const orderResult = await client.query(
      "INSERT INTO orders (customer_id, total_amount, payment_method) VALUES ($1, $2, $3) RETURNING id",
      [customer_id, total_amount, payment_method]
    );
    const orderId = orderResult.rows[0].id;

    // 2. Order items ටික save කරන්න
    for (let item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "Order placed successfully!", orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: "Server Error during order creation" });
  } finally {
    client.release();
  }
};

// Admin/Cashier පැත්තට Orders සියල්ල ලබා ගැනීමට
const getOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name, c.phone as customer_phone 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      ORDER BY o.id DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { createOrder, getOrders };