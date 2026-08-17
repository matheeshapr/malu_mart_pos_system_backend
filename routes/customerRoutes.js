const express = require('express');
const router = express.Router();
const { registerCustomer, loginCustomer, getCustomers, getCustomerOrders } = require('../controllers/customerController');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/', getCustomers);
router.get('/:id/orders', getCustomerOrders);

module.exports = router;