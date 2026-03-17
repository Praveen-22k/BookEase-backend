const mongoose = require("mongoose");

const bookingItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  serviceName: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [bookingItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
    bookingReference: {
      type: String,
      unique: true,
      default: () =>
        "BK" + Date.now().toString() + Math.floor(Math.random() * 1000),
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
