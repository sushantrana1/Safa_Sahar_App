const Report = require("../models/Report");
const User = require("../models/User");
const Redemption = require("../models/Redemption");
const Reward = require("../models/Reward");

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const [
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      rejectedReports,
      resolvedToday,
      totalCitizens,
      totalAdmins,
      totalRewards,
      pendingRedemptions,
      deliveredRedemptions,
    ] = await Promise.all([
      Report.countDocuments({}),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "in_progress" }),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ status: "rejected" }),
      Report.countDocuments({
        status: "resolved",
        resolvedAt: { $gte: startOfToday },
      }),
      User.countDocuments({ role: "citizen" }),
      User.countDocuments({ role: { $in: ["admin", "superadmin"] } }),
      Reward.countDocuments({ active: true }),
      Redemption.countDocuments({ status: "pending" }),
      Redemption.countDocuments({ status: "delivered" }),
    ]);

    // Reports per ward (top 10)
    const reportsByWard = await Report.aggregate([
      { $match: { ward: { $ne: null } } },
      { $group: { _id: "$ward", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, ward: "$_id", count: 1 } },
    ]);

    // Reports per type
    const reportsByType = await Report.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { _id: 0, type: "$_id", count: 1 } },
    ]);

    // Reports over last 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const reportsTrend = await Report.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    const trendMap = new Map();
    reportsTrend.forEach((r) => {
      const key = `${r._id.y}-${String(r._id.m).padStart(2, "0")}-${String(
        r._id.d
      ).padStart(2, "0")}`;
      trendMap.set(key, r.count);
    });

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      last7Days.push({
        date: key,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: trendMap.get(key) || 0,
      });
    }

    res.status(200).json({
      kpis: {
        totalReports,
        pendingReports,
        inProgressReports,
        resolvedReports,
        rejectedReports,
        resolvedToday,
        totalCitizens,
        totalAdmins,
        totalRewards,
        pendingRedemptions,
        deliveredRedemptions,
      },
      reportsByWard,
      reportsByType,
      reportsTrend: last7Days,
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all reports (admin, with filters + pagination)
// @route   GET /api/admin/reports
// @access  Private/Admin
const listReports = async (req, res) => {
  try {
    const { status, type, ward, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (ward) query.ward = Number(ward);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate("user", "name email ward")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Report.countDocuments(query),
    ]);

    res.status(200).json({
      count: reports.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all users — citizens + admins (admin)
// @route   GET /api/admin/citizens
// @access  Private/Admin
const listCitizens = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 100 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [citizens, total] = await Promise.all([
      User.find(query)
        .select("name email ward points phone role createdAt")
        .sort({ points: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      count: citizens.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      citizens,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Promote or demote a user's role (admin only)
// @route   PATCH /api/admin/citizens/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["citizen", "admin"];

    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent self-demotion
    if (
      user._id.toString() === req.user._id.toString() &&
      role !== "admin"
    ) {
      return res
        .status(400)
        .json({ message: "You cannot demote yourself" });
    }

    // Prevent demoting a superadmin
    if (user.role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Cannot change superadmin role" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: `Role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ward: user.ward,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ROLE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, listReports, listCitizens, updateUserRole };