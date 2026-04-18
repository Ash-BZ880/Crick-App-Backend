const express = require("express");
const router = express.Router();
const setupController = require("../controllers/setupController");

// setup
router.post("/setup", setupController.saveSetup);
router.get("/setup", setupController.getSetup);

// photos
router.post("/photo", setupController.savePhotos);
router.get("/photo", setupController.getPhotos);
router.delete("/photo/:public_id", setupController.deletePhoto);

module.exports = router;

