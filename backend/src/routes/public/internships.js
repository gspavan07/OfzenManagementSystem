const express = require("express");
const router = express.Router();
const {
  getActiveBatches,
  createOrder,
  registerIntern,
  checkEmailAvailability,
} = require("../../controllers/public/internshipController");

router.get("/", getActiveBatches);
router.post("/check-email", checkEmailAvailability);
router.post("/create-order", createOrder);
router.post("/register", registerIntern);

module.exports = router;
