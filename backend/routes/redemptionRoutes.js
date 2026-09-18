const express = require("express");
const {
  getMyRedemptions,
  listRedemptions,
  updateRedemptionStatus,
} = require("../controllers/redemptionController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/my", protect, getMyRedemptions);
router.get("/", protect, authorize("admin", "superadmin"), listRedemptions);
router.patch(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  updateRedemptionStatus
);

module.exports = router;
