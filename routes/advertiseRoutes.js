const express = require("express");
const router = express.Router();
const advertiseController = require("../controllers/advertiseController");

// Save photos
router.post("/advertise", advertiseController.savePhotos);

// Get photos
router.get("/advertise", advertiseController.getPhotos);

// Delete photo
router.delete("/advertise/:public_id", advertiseController.deletePhoto);

module.exports = router;