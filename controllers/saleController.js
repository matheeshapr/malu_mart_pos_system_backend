const pool = require('../db');

// නව බිලක් හෝ ඕඩර් එකක් සෑදීම
const createSale = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // customer_id එකත් සමඟ දත්ත ලබා ගැනීම
    const { user_id, customer_id, sub_total, discount, net_total, paid_amount, payment_status, items } = req.body;

    const saleResult = await client.query(
      "INSERT INTO sales (user_id, customer_id, sub_total, discount, net_total, paid_amount, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [user_id || null, customer_id || null, sub_total, discount, net_total, paid_amount, payment_status]
    );

    const saleId = saleResult.rows[0].id;

    for (let item of items) {
      await client.query(
        "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, sub_total) VALUES ($1, $2, $3, $4, $5)",
        [saleId, item.product_id, item.quantity, item.unit_price, item.sub_total]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "Sale created successfully", sale_id: saleId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  } finally {
    client.release();
  }
};

// සියලුම Sales සහ Online Orders, Customers table එක සමඟ JOIN කර ලබා ගැනීම
const getSales = async (req, res) => {
  try {
    const query = `
      SELECT sales.*, 
             customers.name AS customer_name, 
             customers.phone AS customer_phone, 
             customers.nic 
      FROM sales 
      LEFT JOIN customers ON sales.customer_id = customers.id 
      ORDER BY sales.id DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

// Sale Status එක Update කිරීම (Pending -> Paid)
const updateSaleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    
    const result = await pool.query(
      "UPDATE sales SET payment_status = $1 WHERE id = $2 RETURNING *",
      [payment_status, id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  createSale,
  getSales,
  updateSaleStatus
};