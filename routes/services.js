const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, duration, workingHours, workingDays } =
        req.body;
      if (!name || !description || !price || !duration) {
        return res.status(400).json({
          message: "Name, description, price and duration are required",
        });
      }
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
      const service = await Service.create({
        name,
        description,
        price: Number(price),
        duration: Number(duration),
        image: imageUrl,
        workingHours: workingHours ? JSON.parse(workingHours) : undefined,
        workingDays: workingDays ? JSON.parse(workingDays) : undefined,
      });
      res.status(201).json(service);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service)
        return res.status(404).json({ message: "Service not found" });

      const {
        name,
        description,
        price,
        duration,
        workingHours,
        workingDays,
        isActive,
      } = req.body;
      if (name) service.name = name;
      if (description) service.description = description;
      if (price !== undefined) service.price = Number(price);
      if (duration !== undefined) service.duration = Number(duration);
      if (isActive !== undefined)
        service.isActive = isActive === "true" || isActive === true;
      if (workingHours) service.workingHours = JSON.parse(workingHours);
      if (workingDays) service.workingDays = JSON.parse(workingDays);

      if (req.file) {
        if (service.image) {
          const oldPath = path.join(__dirname, "..", service.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        service.image = `/uploads/${req.file.filename}`;
      }

      const updated = await service.save();
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    if (service.image) {
      const imgPath = path.join(__dirname, "..", service.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await service.deleteOne();
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
