const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Service = require("./models/Service");

const services = [
  {
    name: "Deep Tissue Massage",
    description:
      "A therapeutic massage targeting deep muscle layers to relieve tension, reduce pain, and improve mobility.",
    price: 80,
    duration: 60,
    image: "",
    workingHours: { start: "09:00", end: "18:00" },
    workingDays: [1, 2, 3, 4, 5],
  },
  {
    name: "Swedish Relaxation Massage",
    description:
      "Classic full-body massage using gentle strokes to relax muscles, improve circulation and reduce stress.",
    price: 65,
    duration: 60,
    image: "",
    workingHours: { start: "09:00", end: "19:00" },
    workingDays: [1, 2, 3, 4, 5, 6],
  },
  {
    name: "Hot Stone Therapy",
    description:
      "Smooth heated basalt stones placed on key points of the body to ease muscle tension and promote relaxation.",
    price: 95,
    duration: 75,
    image: "",
    workingHours: { start: "10:00", end: "17:00" },
    workingDays: [1, 2, 3, 4, 5],
  },
  {
    name: "Facial Treatment",
    description:
      "Customized deep cleansing facial including exfoliation, mask, and moisturizing for glowing skin.",
    price: 70,
    duration: 45,
    image: "",
    workingHours: { start: "09:00", end: "18:00" },
    workingDays: [1, 2, 3, 4, 5, 6],
  },
  {
    name: "Aromatherapy Session",
    description:
      "Holistic healing treatment using natural plant extracts and essential oils to promote health and well-being.",
    price: 75,
    duration: 60,
    image: "",
    workingHours: { start: "09:00", end: "18:00" },
    workingDays: [1, 2, 3, 4, 5],
  },
  {
    name: "Manicure & Pedicure Combo",
    description:
      "Complete nail care package for hands and feet, including shaping, cuticle care, and polish.",
    price: 55,
    duration: 90,
    image: "",
    workingHours: { start: "09:00", end: "20:00" },
    workingDays: [1, 2, 3, 4, 5, 6],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    await User.deleteMany({});
    await Service.deleteMany({});
    console.log("Cleared existing data");

    const admin = new User({
      name: "Admin User",
      email: "admin@booking.com",
      password: "admin123",
      phone: "+1234567890",
      role: "admin",
    });
    await admin.save();
    console.log("Admin created: admin@booking.com / admin123");

    const user = new User({
      name: "John Doe",
      email: "user@booking.com",
      password: "user123",
      phone: "+0987654321",
      role: "user",
    });
    await user.save();
    console.log("User created: user@booking.com / user123");

    await Service.insertMany(services);
    console.log(`${services.length} services created`);

    console.log("\n=== SEEDING COMPLETE ===");
    console.log("Admin Login: admin@booking.com / admin123");
    console.log("User Login:  user@booking.com / user123");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
