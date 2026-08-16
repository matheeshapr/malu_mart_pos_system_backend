const express = require('express');
const router = express.Router();
const { createSale, getSales, updateSaleStatus } = require('../controllers/saleController');

router.post('/', createSale);
router.get('/', getSales);
router.put('/:id', updateSaleStatus);

module.exports = router;