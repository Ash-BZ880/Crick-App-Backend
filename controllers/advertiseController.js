const Advertise = require("../models/Advertise");
const cloudinary = require("cloudinary").v2;

// ---------------- CLOUDINARY CONFIG ----------------
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ---------------- SAVE PHOTOS ----------------
exports.savePhotos = async (req, res) => {
  try {
    const { photos } = req.body;

    if (!photos || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No photos provided",
      });
    }

    let advertise = await Advertise.findOne();

    // create doc if not exists
    if (!advertise) {
      advertise = new Advertise({ photos: [] });
    }

    // push new photos
    advertise.photos.push(...photos);

    await advertise.save();

    res.status(200).json({
      success: true,
      message: "Photos saved successfully",
      photos: advertise.photos,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ---------------- GET PHOTOS ----------------
exports.getPhotos = async (req, res) => {
  try {
    const advertise = await Advertise.findOne();

    res.status(200).json({
      success: true,
      photos: advertise?.photos || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ---------------- DELETE PHOTO ----------------
exports.deletePhoto = async (req, res) => {
  try {
    const { public_id } = req.params;

    // 1️⃣ Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // 2️⃣ Delete from DB
    const advertise = await Advertise.findOne();

    if (!advertise) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    advertise.photos = advertise.photos.filter(
      (photo) => photo.public_id !== public_id
    );

    await advertise.save();

    res.status(200).json({
      success: true,
      message: "Photo deleted successfully",
      photos: advertise.photos,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
};