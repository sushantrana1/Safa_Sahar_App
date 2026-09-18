const mongoose = require("mongoose");
const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const User = require("../models/User");
const { addPoints } = require("../utils/ledger");

// @desc    Redeem a reward with points
// @route   POST /api/rewards/:id/redeem
// @access  Private
const redeemReward = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reward = await Reward.findById(req.params.id).session(session);

    if (!reward) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Reward not found" });
    }

    if (!reward.active) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Reward is not active" });
    }

    if (reward.stock <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Reward is out of stock" });
    }

    const user = await User.findById(req.user._id).session(session);

    if (user.points < reward.pointsCost) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Not enough points. You have ${user.points}, need ${reward.pointsCost}.`,
      });
    }

    // Decrement stock
    reward.stock -= 1;
    await reward.save({ session });

    // Deduct points + ledger (outside session for simplicity; can be improved)
    await addPoints(user._id, -reward.pointsCost, {
      type: "redeemed",
      description: `Redeemed: ${reward.title}`,
      reward: reward._id,
    });

    // Create redemption record
    const [redemption] = await Redemption.create(
      [
        {
          user: user._id,
          reward: reward._id,
          rewardTitle: reward.title,
          pointsSpent: reward.pointsCost,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({ redemption });
  } catch (error) {
    await session.abortTransaction();
    console.error("REDEEM ERROR:", error);
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get current user's redemptions
// @route   GET /api/redemptions/my
// @access  Private
const getMyRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ user: req.user._id })
      .populate("reward", "imageUrl category")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ count: redemptions.length, redemptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all redemptions (admin)
// @route   GET /api/redemptions
// @access  Private/Admin
const listRedemptions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const redemptions = await Redemption.find(query)
      .populate("user", "name email ward")
      .populate("reward", "title imageUrl")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ count: redemptions.length, redemptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update redemption status (admin)
// @route   PATCH /api/redemptions/:id
// @access  Private/Admin
const updateRedemptionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowed = ["pending", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const redemption = await Redemption.findById(req.params.id);
    if (!redemption) {
      return res.status(404).json({ message: "Redemption not found" });
    }

    // Handle cancel → refund points + restock
    if (status === "cancelled" && redemption.status !== "cancelled") {
      await addPoints(redemption.user, redemption.pointsSpent, {
        type: "adjusted",
        description: `Refund: ${redemption.rewardTitle} cancelled`,
        reward: redemption.reward,
      });

      await Reward.findByIdAndUpdate(redemption.reward, {
        $inc: { stock: 1 },
      });
    }

    redemption.status = status;
    if (notes !== undefined) redemption.notes = notes;
    if (status === "delivered") redemption.deliveredAt = new Date();

    await redemption.save();
    await redemption.populate("user", "name email ward");

    res.status(200).json({ redemption });
  } catch (error) {
    console.error("UPDATE REDEMPTION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  redeemReward,
  getMyRedemptions,
  listRedemptions,
  updateRedemptionStatus,
};