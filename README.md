# 🐟 MaluMart - REST API Backend (Node.js & Express)

This is the **Backend server** for the MaluMart POS and E-commerce application. It provides RESTful APIs for product management, inventory tracking, real-time online orders, categories, and staff authentication.

---

## ✨ Features

- **Product Management:** Full CRUD operations for inventory, supporting cost/selling price, stock quantities, low-stock threshold alerts, and custom product image URLs (`image_url`).
- **Real-Time Order Processing:** Handles online customer orders (`Pending` status) and POS checkout sales (`Paid` status).
- **Auto Stock & Low Stock Monitoring:** Tracks inventory levels and triggers low-stock alerts.
- **Category & Staff Management:** APIs to manage categories and admin/cashier user accounts with PIN codes.
- **Database Integration:** Relational database setup with PostgreSQL / MySQL using connection pooling (`pg` / `mysql2`).

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL / MySQL
- **Middleware:** CORS, Express JSON parser

---
