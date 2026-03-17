const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "18:00" },
    },
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Service", serviceSchema);
