const pool = require('../db');

// නව බිලක් හෝ ඕඩර් එකක් සෑදීම
const createSale = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
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

      // POS එකෙන් කරන සාමාන්‍ය ගනුදෙනු වලදී (Paid) පමණක් වහාම Stock එක අඩු වේ.
      // කස්ටමර් Store එකෙන් දාන Online Orders (Pending) වලදී Stock එක මෙතැනදී අඩු නොවේ.
      if (payment_status === 'Paid') {
        await client.query(
          "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
          [item.quantity, item.product_id]
        );
      }
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

// Sale Status එක Update කිරීම (Pending -> Paid වන විට පමණක් Stock අඩු වේ)
const updateSaleStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { payment_status } = req.body;
    
    const saleQuery = await client.query("SELECT * FROM sales WHERE id = $1", [id]);
    if (saleQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Sale not found" });
    }
    const sale = saleQuery.rows[0];

    // Pending ලෙස තිබී Cashier විසින් Paid (Collect) කරන අවස්ථාවකදී පමණක් Stock එක අඩු කිරීම
    if (sale.payment_status === 'Pending' && payment_status === 'Paid') {
      const itemsQuery = await client.query("SELECT * FROM sale_items WHERE sale_id = $1", [id]);
      
      for (let item of itemsQuery.rows) {
        await client.query(
          "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
          [item.quantity, item.product_id]
        );
      }
    }

    const result = await client.query(
      "UPDATE sales SET payment_status = $1, paid_amount = net_total WHERE id = $2 RETURNING *",
      [payment_status, id]
    );

    await client.query('COMMIT');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  } finally {
    client.release();
  }
};

module.exports = {
  createSale,
  getSales,
  updateSaleStatus
};