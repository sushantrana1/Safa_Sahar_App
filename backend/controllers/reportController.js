const Report = require("../models/Report");
const User = require("../models/User");
const { addPoints } = require("../utils/ledger");

const POINTS_PER_REPORT = 10;

// Escape special regex chars to prevent ReDoS
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { title, description, type, lat, lng, address, ward } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
    if (!lat || !lng) {
      return res.status(400).json({ message: "Location is required" });
    }

    const imageUrl = req.file.path;

    const report = await Report.create({
      user: req.user._id,
      title: title.trim(),
      description: description.trim(),
      type,
      imageUrl,
      location: { lat: Number(lat), lng: Number(lng) },
      address: (address || "").trim(),
      ward: ward ? Number(ward) : req.user.ward || null,
      pointsAwarded: 0,
    });

    res.status(201).json({ report });
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports (public feed, with filters)
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res) => {
  try {
    const { status, type, ward, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (ward) query.ward = Number(ward);

    if (search) {
      if (search.length > 100) {
        return res.status(400).json({ message: "Search query too long" });
      }
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { address: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const safeLimit = Math.min(Number(limit), 100); // cap at 100

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate("user", "name ward avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Report.countDocuments(query),
    ]);

    res.status(200).json({
      count: reports.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / safeLimit),
      reports,
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's reports
// @route   GET /api/reports/my
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Public
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("user", "name ward avatarUrl")
      .lean();

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update report status (admin only)
// @route   PATCH /api/reports/:id/status
// @access  Private/Admin
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["pending", "in_progress", "resolved", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const previousStatus = report.status;
    report.status = status;
    if (status === "resolved") {
      report.resolvedAt = new Date();
    } else {
      report.resolvedAt = null;
    }

    // Award points on first transition to "resolved"
    if (
      status === "resolved" &&
      previousStatus !== "resolved" &&
      !report.pointsAwarded
    ) {
      await addPoints(report.user, POINTS_PER_REPORT, {
        type: "earned_report",
        description: `Report resolved: ${report.title}`,
        report: report._id,
      });
      report.pointsAwarded = POINTS_PER_REPORT;
    }

    await report.save();
    await report.populate("user", "name ward avatarUrl");

    res.status(200).json({ report });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own report (citizen, only while pending)
// @route   PATCH /api/reports/:id
// @access  Private (owner only)
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own reports" });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        message:
          "Cannot edit a report that has been reviewed. Contact your ward office if there's an issue.",
      });
    }

    const { title, description, type, address, ward } = req.body;

    if (title !== undefined) report.title = title.trim();
    if (description !== undefined) report.description = description.trim();
    if (type !== undefined) report.type = type;
    if (address !== undefined) report.address = address.trim();
    if (ward !== undefined) report.ward = ward ? Number(ward) : null;

    await report.save();
    await report.populate("user", "name ward avatarUrl");

    res.status(200).json({ report });
  } catch (error) {
    console.error("UPDATE REPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete own report (citizen, only while pending)
// @route   DELETE /api/reports/:id
// @access  Private (owner only)
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reports" });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        message:
          "Cannot delete a report that has been reviewed. Contact your ward office if needed.",
      });
    }

    await report.deleteOne();

    res.status(200).json({ message: "Report deleted" });
  } catch (error) {
    console.error("DELETE REPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getMyReports,
  getReportById,
  updateReportStatus,
  updateReport,
  deleteReport,
};