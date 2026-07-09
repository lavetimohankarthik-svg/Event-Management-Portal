const User = require("../models/User");
const bcrypt = require("bcrypt");

const seedAdmin = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    if (admin) {
      const isPasswordMatch = await bcrypt.compare(process.env.ADMIN_PASSWORD, admin.password);
      if (admin.email !== process.env.ADMIN_EMAIL || !isPasswordMatch) {
        admin.email = process.env.ADMIN_EMAIL;
        admin.password = hashedPassword;
        await admin.save();
        console.log("====================================");
        console.log("✅ Admin Account Synced from .env Credentials");
        console.log(`Email: ${process.env.ADMIN_EMAIL}`);
        console.log("====================================");
      } else {
        console.log("✅ Admin already exists and matches .env credentials");
      }
      return;
    }

    await User.create({
      firstName: "System",
      lastName: "Administrator",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    console.log("====================================");
    console.log("✅ Default Admin Created");
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log("====================================");
  } catch (error) {
    console.log(error);
  }
};

module.exports = seedAdmin;