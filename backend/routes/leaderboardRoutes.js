const express = require("express");
const { getLeaderboard } = require("../controllers/userController");

const router = express.Router();

router.get("/", getLeaderboard);

module.exports = router;