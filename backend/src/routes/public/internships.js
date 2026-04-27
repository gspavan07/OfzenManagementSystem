const express = require('express');
const router = express.Router();
const {
  getActiveBatches,
  createOrder,
  registerIntern,
} = require('../../controllers/public/internshipController');

router.get('/batches', getActiveBatches);
router.post('/create-order', createOrder);
router.post('/register', registerIntern);

module.exports = router;
