const User = require("../models/User");
const Transaction = require("../models/Transaction");

/**
 * Atomically add points to a user and log a transaction.
 * @param {ObjectId} userId
 * @param {number} amount - positive to earn, negative to spend
 * @param {Object} options - { type, description, report, reward }
 * @returns {Transaction}
 */
async function addPoints(userId, amount, options = {}) {
  const { type = "adjusted", description = "Points adjusted", report = null, reward = null } = options;

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { points: amount } },
    { new: true }
  );

  if (!user) throw new Error("User not found");

  // Guard: never let balance go negative
  if (user.points < 0) {
    // roll back
    user.points = user.points - amount;
    await user.save();
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