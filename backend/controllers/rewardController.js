const Reward = require("../models/Reward");

// @desc    List all active rewards (public)
// @route   GET /api/rewards
// @access  Public
const listRewards = async (req, res) => {
  try {
    const { activeOnly = "true" } = req.query;
    const query = activeOnly === "true" ? { active: true } : {};

    const rewards = await Reward.find(query)
      .sort({ pointsCost: 1, createdAt: -1 })
      .lean();

    res.status(200).json({ count: rewards.length, rewards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single reward
// @route   GET /api/rewards/:id
// @access  Public
const getReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id).lean();
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }
    res.status(200).json({ reward });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create reward (admin)
// @route   POST /api/rewards
// @access  Private/Admin
const createReward = async (req, res) => {
  try {
    const { title, description, pointsCost, category, stock, imageUrl, active } = req.body;

    const reward = await Reward.create({
      title,
      description,
      pointsCost: Number(pointsCost),
      category: category || "voucher",
      stock: stock != null ? Number(stock) : 100,
      imageUrl: imageUrl || null,
      active: active !== false,
      createdBy: req.user._id,
    });

    res.status(201).json({ reward });
  } catch (error) {
    console.error("CREATE REWARD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reward (admin)
// @route   PATCH /api/rewards/:id
// @access  Private/Admin
const updateReward = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.imageUrl === "") payload.imageUrl = null;

    const reward = await Reward.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    res.status(200).json({ reward });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete reward (admin)
// @route   DELETE /api/rewards/:id
// @access  Private/Admin
const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }
    res.status(200).json({ message: "Reward deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload reward image (admin)
// @route   POST /api/rewards/upload
// @access  Private/Admin
const uploadRewardImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Multer + Cloudinary sets req.file.path to the secure URL
    res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    console.error("UPLOAD REWARD IMAGE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listRewards,
  getReward,
  createReward,
  updateReward,
  deleteReward,
  uploadRewardImage,
};