const express = require('express');
const router = express.Router();
const { registerCustomer, loginCustomer, getCustomers } = require('../controllers/customerController');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/', getCustomers);

module.exports = router;