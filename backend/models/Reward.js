const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 500,
    },
    pointsCost: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ["voucher", "merchandise", "service", "other"],
      default: "voucher",
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);