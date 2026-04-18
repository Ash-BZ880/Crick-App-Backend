const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const Setup = require("../models/Setup");
const {
  canSendMail,
  normalizeRecipient,
  sendMailRobust,
} = require("../config/mail");

// Ensure default admin exists
const ensureDefaultAdmin = async () => {
  const admin = await Admin.findOne({ username: "admin" });
  if (!admin) {
    const hashed = await bcrypt.hash("12345", 10);
    await Admin.create({ username: "admin", password: hashed });
    console.log("Default admin created with password '12345'");
  }
};

// ---------------- LOGIN -----------------
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) return res.status(404).json({ error: "Admin not found." });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect password." });

    // Respond immediately — SMTP notification is slow (often multi-second per attempt).
    res.status(200).json({ message: "Login successful." });

    void (async () => {
      try {
        const setup = await Setup.findOne();
        const adminDetails = setup?.admin || { name: username, email: null };
        const rawName = (adminDetails.name || username || "").trim();
        const firstName = rawName.split(" ")[0] || username;

        const templatePath = path.join(__dirname, "../templates/loginEmail.html");
        let html = fs.readFileSync(templatePath, "utf-8");
        html = html.replace(/{{name}}/g, firstName);

        const notifyTo =
          normalizeRecipient(adminDetails?.email) ||
          normalizeRecipient(process.env.ADMIN_NOTIFY_EMAIL) ||
          normalizeRecipient(process.env.EMAIL_USER);

        if (canSendMail() && notifyTo) {
          await sendMailRobust({
            to: notifyTo,
            subject: "Login Successful",
            html,
          });
        } else if (canSendMail() && !notifyTo) {
          console.warn(
            "[mail] Login notify skipped: set Setup admin email, ADMIN_NOTIFY_EMAIL, or EMAIL_USER."
          );
        }
      } catch (emailErr) {
        console.error("Login notification email failed:", emailErr.message);
      }
    })();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const adminUser = await Admin.findOne({ username: "admin" });
    if (!adminUser)
      return res.status(404).json({ message: "Admin not found." });

    const isMatch = await bcrypt.compare(oldPassword, adminUser.password);
    if (!isMatch)
      return res.status(401).json({ message: "Old password incorrect." });

    // hash + save
    adminUser.password = await bcrypt.hash(newPassword, 10);
    await adminUser.save();

    // -------- NOTIFY (optional: needs Setup admin row for name/template context) --------
    const setup = await Setup.findOne();
    const admin = setup?.admin;
    const firstName = admin?.name?.trim().split(" ")[0] || "";

    if (setup && admin) {
      const templatePath = path.join(__dirname, "../templates/passwordEmail.html");
      let html = fs.readFileSync(templatePath, "utf-8");
      html = html
        .replace(/{{name}}/g, firstName)
        .replace(/{{newPassword}}/g, newPassword);

      const pwdNotifyTo =
        normalizeRecipient(admin?.email) ||
        normalizeRecipient(process.env.ADMIN_NOTIFY_EMAIL) ||
        normalizeRecipient(process.env.EMAIL_USER);

      if (canSendMail() && pwdNotifyTo) {
        try {
          await sendMailRobust({
            to: pwdNotifyTo,
            subject: "Password Changed",
            html,
          });
        } catch (emailErr) {
          console.error("Password-change email failed:", emailErr.message);
        }
      } else if (canSendMail() && !pwdNotifyTo) {
        console.warn(
          "[mail] Password-change notify skipped: set Setup admin email, ADMIN_NOTIFY_EMAIL, or EMAIL_USER."
        );
      }
    } else {
      console.warn(
        "[mail] Password changed but no Setup record — password notification email skipped."
      );
    }

    res.status(200).json({
      message: "Password changed successfully.",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  login,
  changePassword,
  ensureDefaultAdmin
};
