const express = require("express");
const {
  getMe,
  getMyTransactions,
  getLeaderboard,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/me/transactions", protect, getMyTransactions);

module.exports = router;