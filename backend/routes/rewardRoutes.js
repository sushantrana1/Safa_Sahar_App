const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  listRewards,
  getReward,
  createReward,
  updateReward,
  deleteReward,
  uploadRewardImage,
} = require("../controllers/rewardController");
const { redeemReward } = require("../controllers/redemptionController");
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

// ===== Public =====
router.get("/", listRewards);

// ===== Admin: upload image (must be BEFORE /:id) =====
router.post(
  "/upload",
  protect,
  authorize("admin", "superadmin"),
  upload.single("image"),
  uploadRewardImage
);

// ===== Admin: create reward =====
router.post(
  "/",
  protect,
  authorize("admin", "superadmin"),
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be 3-100 chars"),
    body("description")
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage("Description must be 5-500 chars"),
    body("pointsCost")
      .isInt({ min: 1 })
      .withMessage("Points cost must be a positive number"),
  ],
  validate,
  createReward
);

// ===== Admin: update / delete =====
router.patch(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  updateReward
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  deleteReward
);

// ===== Redeem =====
router.post("/:id/redeem", protect, redeemReward);

// ===== Public: get single reward (must be LAST) =====
router.get("/:id", getReward);

module.exports = router;