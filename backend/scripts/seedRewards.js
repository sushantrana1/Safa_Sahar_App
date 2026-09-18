require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Reward = require("../models/Reward");
const User = require("../models/User");

const seed = async () => {
  await connectDB();

  // Find any admin to attribute the rewards to
  const admin = await User.findOne({ role: { $in: ["admin", "superadmin"] } });
  if (!admin) {
    console.error("No admin user found. Register an admin first.");
    process.exit(1);
  }

 const rewards = [
  {
    title: "Rs. 50 Mobile Recharge",
    description: "Get Rs. 50 mobile top-up credited to your phone within 24 hours.",
    pointsCost: 500,
    category: "voucher",
    stock: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=800&auto=format&fit=crop&q=70",
  },
  {
    title: "Rs. 100 Mobile Recharge",
    description: "Get Rs. 100 mobile top-up credited to your phone within 24 hours.",
    pointsCost: 1000,
    category: "voucher",
    stock: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=800&auto=format&fit=crop&q=70",
  },
  {
    title: "Safa Sahar T-Shirt",
    description: "Eco-friendly cotton t-shirt with the Safa Sahar logo. Available in S/M/L/XL.",
    pointsCost: 800,
    category: "merchandise",
    stock: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=70",
  },
  {
    title: "Free Waste Pickup (Bulk)",
    description: "Schedule a free bulk waste pickup from your home — up to 50kg.",
    pointsCost: 300,
    category: "service",
    stock: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=70",
  },
  {
    title: "Plant a Tree in Your Name",
    description: "We plant a sapling in your ward and send you a certificate + photo.",
    pointsCost: 200,
    category: "service",
    stock: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&auto=format&fit=crop&q=70",
  },
  {
    title: "Rs. 500 Store Voucher",
    description: "Redeem at partner eco-stores in Kathmandu (Bhatbhateni, Saleways).",
    pointsCost: 2000,
    category: "voucher",
    stock: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&auto=format&fit=crop&q=70",
  },
];

  await Reward.deleteMany({});
  const created = await Reward.insertMany(
    rewards.map((r) => ({ ...r, createdBy: admin._id }))
  );

  console.log(`Seeded ${created.length} rewards`);
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});