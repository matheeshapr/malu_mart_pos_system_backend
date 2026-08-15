const pool = require('../db');

const createSale = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            user_id,
            customer_id,
            sub_total,
            discount,
            net_total,
            paid_amount,
            payment_status,
            items
        } = req.body;

        await client.query('BEGIN');

        // 1. Insert into sales table
        const saleResult = await client.query(
            `INSERT INTO sales (user_id, customer_id, sub_total, discount, net_total, paid_amount, payment_status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [user_id, customer_id, sub_total, discount, net_total, paid_amount, payment_status]
        );

        const saleId = saleResult.rows[0].id;

        // 2. Insert into sale_items table and update stock
        for (let item of items) {
            await client.query(
                `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, sub_total) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [saleId, item.product_id, item.quantity, item.unit_price, item.sub_total]
            );

            // 3. Deduct the sold quantity from products table
            await client.query(
                `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: "Sale completed successfully",
            sale_id: saleId
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: "Server Error during checkout" });
    } finally {
        client.release();
    }
};

const getSales = async (req, res) => {
    try {
        const allSales = await pool.query("SELECT * FROM sales ORDER BY sale_date DESC");
        res.status(200).json(allSales.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = {
    createSale,
    getSales
};