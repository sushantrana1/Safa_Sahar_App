const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const {
  createReport,
  getReports,
  getMyReports,
  getReportById,
  updateReportStatus,
  updateReport,
  deleteReport,
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

// Per-user limit: 10 reports per hour
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many reports. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

// ===== Public feed =====
router.get("/", getReports);

// ===== Current user's reports =====
router.get("/my", protect, getMyReports);

// ===== Create report (rate-limited) =====
router.post(
  "/",
  protect,
  reportLimiter,
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

// ===== Admin: update status =====
router.patch(
  "/:id/status",
  protect,
  authorize("admin", "superadmin"),
  [body("status").notEmpty().withMessage("Status is required")],
  validate,
  updateReportStatus
);

// ===== Citizen: edit own report =====
router.patch(
  "/:id",
  protect,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be 3-100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be 10-1000 characters"),
    body("type")
      .optional()
      .isIn(["illegal_dumping", "missed_pickup", "overflowing_bin", "other"])
      .withMessage("Invalid report type"),
  ],
  validate,
  updateReport
);

// ===== Citizen: delete own report =====
router.delete("/:id", protect, deleteReport);

// ===== Public: get single report (must be LAST) =====
router.get("/:id", getReportById);

module.exports = router;