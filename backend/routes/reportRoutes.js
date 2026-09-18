const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  createReport,
  getReports,
  getMyReports,
  getReportById,
  updateReportStatus,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Public feed (list)
router.get("/", getReports);

// Current user's reports (must be BEFORE /:id)
router.get("/my", protect, getMyReports);

// Create
router.post(
  "/",
  protect,
  upload.single("image"),
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be 3-100 characters"),
    body("description")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be 10-1000 characters"),
    body("type")
      .isIn(["illegal_dumping", "missed_pickup", "overflowing_bin", "other"])
      .withMessage("Invalid report type"),
  ],
  validate,
  createReport
);

// Admin: update status
router.patch(
  "/:id/status",
  protect,
  authorize("admin", "superadmin"),
  [body("status").notEmpty().withMessage("Status is required")],
  validate,
  updateReportStatus
);

// Single report (must be LAST)
router.get("/:id", getReportById);

module.exports = router;