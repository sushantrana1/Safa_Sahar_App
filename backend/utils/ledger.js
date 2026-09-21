const User = require("../models/User");
const Transaction = require("../models/Transaction");

/**
 * Atomically add points to a user and log a transaction.
 * Uses a conditional update to prevent race conditions that could
 * push the balance negative.
 *
 * @param {ObjectId} userId
 * @param {number} amount - positive to earn, negative to spend
 * @param {Object} options - { type, description, report, reward }
 * @returns {Transaction}
 */
async function addPoints(userId, amount, options = {}) {
  const {
    type = "adjusted",
    description = "Points adjusted",
    report = null,
    reward = null,
  } = options;

  // Build a query that guarantees the balance won't go negative.
  // If `amount` is negative (spend), require `points >= -amount`.
  const query = { _id: userId };
  if (amount < 0) {
    query.points = { $gte: -amount };
  }

  const user = await User.findOneAndUpdate(
    query,
    { $inc: { points: amount } },
    { new: true }
  );

  if (!user) {
    // Either user doesn't exist OR insufficient points
    const exists = await User.findById(userId).select("_id");
    if (!exists) throw new Error("User not found");
    throw new Error("Insufficient points");
  }

  const txn = await Transaction.create({
    user: userId,
    type,
    amount,
    balanceAfter: user.points,
    description,
    report,
    reward,
  });

  return txn;
}

module.exports = { addPoints };