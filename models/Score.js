const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  // 🔥 reference to Match
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },

  // 🔥 self reference (Score → Score)
  scoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Live",
    required: true,
  },

  matchType: String,
  scoringTeam: String,
  chessingTeam: String,

  inning1: {
    runs: Number,
    wickets: Number,
    overs: String,
  },
  
  inning2: {
    runs: Number,
    wickets: Number,
    overs: String,
  },

  winnerCard3: String,
  maxOver: Number,
  date: String,
});

module.exports = mongoose.model("Score", scoreSchema);