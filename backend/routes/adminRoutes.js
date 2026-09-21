const express = require("express");
const {
  getStats,
  listReports,
  listCitizens,
  updateUserRole,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin", "superadmin"));

router.get("/stats", getStats);
router.get("/reports", listReports);
router.get("/citizens", listCitizens);
router.patch("/citizens/:id/role", updateUserRole);

module.exports = router;