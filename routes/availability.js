const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect, adminOnly } = require("../middleware/auth");

router.put("/:serviceId", protect, adminOnly, async (req, res) => {
  try {
    const { workingHours, workingDays } = req.body;
    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });
    if (workingHours) service.workingHours = workingHours;
    if (workingDays) service.workingDays = workingDays;
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:serviceId", async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId).select(
      "workingHours workingDays name",
    );
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
