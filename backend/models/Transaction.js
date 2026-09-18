const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["earned_report", "earned_bonus", "redeemed", "adjusted"],
      required: true,
    },
    amount: {
      type: Number,
      required: true, // positive = credit, negative = debit
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional linkage to source
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      default: null,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);