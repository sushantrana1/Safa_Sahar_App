const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
      minlength: 10,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: [
        "illegal_dumping",
        "missed_pickup",
        "overflowing_bin",
        "other",
      ],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    ward: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending",
      index: true,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Text search index (for Phase 4 filters)
reportSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Report", reportSchema);