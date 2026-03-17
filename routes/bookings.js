const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/check-availability", async (req, res) => {
  try {
    const { items } = req.body;
    const results = [];

    for (const item of items) {
      const service = await Service.findById(item.serviceId);
      if (!service) {
        results.push({
          serviceId: item.serviceId,
          available: false,
          reason: "Service not found",
        });
        continue;
      }

      const dayOfWeek = new Date(item.date).getDay();
      if (!service.workingDays.includes(dayOfWeek)) {
        results.push({
          serviceId: item.serviceId,
          serviceName: service.name,
          available: false,
          reason: "Not a working day",
        });
        continue;
      }

      const [startH, startM] = service.workingHours.start
        .split(":")
        .map(Number);
      const [endH, endM] = service.workingHours.end.split(":").map(Number);
      const [slotH, slotM] = item.time.split(":").map(Number);
      const slotMins = slotH * 60 + slotM;
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;

      if (slotMins < startMins || slotMins + service.duration > endMins) {
        results.push({
          serviceId: item.serviceId,
          serviceName: service.name,
          available: false,
          reason: `Working hours: ${service.workingHours.start} - ${service.workingHours.end}`,
        });
        continue;
      }

      const existing = await Booking.findOne({
        "items.service": item.serviceId,
        "items.date": item.date,
        "items.time": item.time,
        status: { $ne: "cancelled" },
      });

      if (existing) {
        results.push({
          serviceId: item.serviceId,
          serviceName: service.name,
          available: false,
          reason: "Slot already booked",
        });
      } else {
        results.push({
          serviceId: item.serviceId,
          serviceName: service.name,
          available: true,
        });
      }
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;
    if (!customer || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Customer details and items required" });
    }
    const bookingReference =
      "BK" + Date.now().toString() + Math.floor(Math.random() * 1000);
    const booking = await Booking.create({
      customer,
      items,
      totalAmount,
      bookingReference,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/ref/:ref", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingReference: req.params.ref,
    }).populate("items.service", "name");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { date, customer, service, status } = req.query;
    let query = {};
    if (status) query.status = status;
    if (customer) query["customer.name"] = { $regex: customer, $options: "i" };

    let bookings = await Booking.find(query).sort({ createdAt: -1 });

    if (date)
      bookings = bookings.filter((b) => b.items.some((i) => i.date === date));
    if (service)
      bookings = bookings.filter((b) =>
        b.items.some((i) =>
          i.serviceName.toLowerCase().includes(service.toLowerCase()),
        ),
      );

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/cancel", protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
