const mongoose = require("mongoose");

const advertiseSchema = new mongoose.Schema(
  {
    photos: [
      {
        name: String,
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Advertise", advertiseSchema);