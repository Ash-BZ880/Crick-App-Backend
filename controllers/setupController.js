const Setup = require("../models/Setup");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const { canSendMail, normalizeRecipient, sendMailRobust } = require("../config/mail");

// ---------------- CLOUDINARY CONFIG ----------------
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ---------------- SAVE SETUP ----------------
exports.saveSetup = async (req, res) => {
  try {
    const { admin, info, venue } = req.body;
    

    if (!admin || !info || !venue)
      throw new Error("Invalid payload structure");

    // Save to DB
    let setup = await Setup.findOne();
    if (!setup) setup = new Setup();
    

    setup.admin = admin;
    setup.info = info;
    setup.venue = venue;

    await setup.save();
    
    const firstName = admin?.name?.trim().split(" ")[0] || "";

    // Load template
    const templatePath = path.join(__dirname, "../templates/setupEmail.html");
    let html = fs.readFileSync(templatePath, "utf-8");
   
    // Prepare safe data replacements
    const data = {
      firstName: firstName,
      name: admin?.name || "",
      email: admin?.email || "",
      phone: admin?.phone || "",
      address: admin?.address || "",
      names: info?.names || "",
      series: info?.series || "",
      types: info?.types || "",
      stadium: venue?.stadium || "",
      location: venue?.location || "",
      country: venue?.country || "",
    };

    // Replace placeholders in template
    Object.keys(data).forEach((key) => {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
    });

    let emailSent = false;
    const setupNotifyTo =
      normalizeRecipient(admin?.email) ||
      normalizeRecipient(process.env.ADMIN_NOTIFY_EMAIL) ||
      normalizeRecipient(process.env.EMAIL_USER);

    if (canSendMail() && setupNotifyTo) {
      try {
        await sendMailRobust({
          to: setupNotifyTo,
          subject: "Setup Completed",
          html,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error("Setup notification email failed:", emailErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? "Setup saved; confirmation email sent."
        : "Setup saved. Email was not sent (check admin email and EMAIL_* env on the server).",
      emailSent,
      data: setup,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

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

    let setup = await Setup.findOne();
    if (!setup) setup = new Setup();

    setup.photos = [...(setup.photos || []), ...photos];

    await setup.save();

    res.status(200).json({
      success: true,
      message: "Photos saved successfully",
      data: setup,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ---------------- GET SETUP ----------------
exports.getSetup = async (req, res) => {
  try {
    const setup = await Setup.findOne();

    res.status(200).json({
      success: true,
      data: setup,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Error fetching setup",
    });
  }
};

// ---------------- GET PHOTOS ----------------
exports.getPhotos = async (req, res) => {
  try {
    const setup = await Setup.findOne();

    res.status(200).json({
      success: true,
      photos: setup?.photos || [],
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Error fetching photos",
    });
  }
};

// ---------------- DELETE PHOTO (DB + CLOUDINARY) ----------------
exports.deletePhoto = async (req, res) => {
  try {
    const { public_id } = req.params;

    // 1️⃣ Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // 2️⃣ Delete from DB
    const setup = await Setup.findOne();

    if (!setup) {
      return res.status(404).json({
        success: false,
        message: "Setup not found",
      });
    }

    setup.photos = setup.photos.filter(
      (p) => p.public_id !== public_id
    );

    await setup.save();

    res.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
};