const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    // Snapshot fields (in case reward is edited later)
    rewardTitle: { type: String, required: true },
    pointsSpent: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

redemptionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Redemption", redemptionSchema);