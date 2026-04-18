const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  name: String,
  url: String,
  public_id: String,
});

const setupSchema = new mongoose.Schema(
  {
    admin: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },
    info: {
      names: String,
      series: String,
      types: String,
    },
    venue: {
      stadium: String,
      location: String,
      country: String,
    },
    photos: [photoSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setup", setupSchema);