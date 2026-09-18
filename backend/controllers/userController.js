const User = require("../models/User");
const Report = require("../models/Report");
const Transaction = require("../models/Transaction");

// Badge tiers based on points
const BADGE_TIERS = [
  { name: "Bronze", min: 0, color: "amber" },
  { name: "Silver", min: 100, color: "slate" },
  { name: "Gold", min: 500, color: "yellow" },
  { name: "Platinum", min: 1500, color: "primary" },
];

const getBadgeForPoints = (points) => {
  let current = BADGE_TIERS[0];
  let next = null;
  for (let i = 0; i < BADGE_TIERS.length; i++) {
    if (points >= BADGE_TIERS[i].min) {
      current = BADGE_TIERS[i];
      next = BADGE_TIERS[i + 1] || null;
    }
  }
  return { current, next };
};

// @desc    Get current user full profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    const [reportCount, resolvedCount] = await Promise.all([
      Report.countDocuments({ user: req.user._id }),
      Report.countDocuments({ user: req.user._id, status: "resolved" }),
    ]);

    const badge = getBadgeForPoints(user.points);

    res.status(200).json({
      user: {
        ...user,
        reportCount,
        resolvedCount,
        badge,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's point transactions
// @route   GET /api/users/me/transactions
// @access  Private
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top 10 citizens by points
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({ role: "citizen" })
      .select("name ward points avatarUrl")
      .sort({ points: -1 })
      .limit(10)
      .lean();

    const ranked = topUsers.map((u, i) => ({
      rank: i + 1,
      ...u,
      badge: getBadgeForPoints(u.points).current,
    }));

    res.status(200).json({ leaderboard: ranked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMe, getMyTransactions, getLeaderboard };