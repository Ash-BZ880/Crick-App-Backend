const mongoose = require('mongoose');
const Live = require("../models/Live");

const EXTRAS_DEFAULTS = { total: 0, wide: 0, noBall: 0, Lb: 0, Bye: 0 };

const normalizeExtras = (extras) => ({
  ...EXTRAS_DEFAULTS,
  ...(extras || {}),
});

const normalizeLivePayload = (payload = {}) => {
  const body = { ...payload };
  body.extras = normalizeExtras(body.extras);
  body.inning1 = {
    ...(body.inning1 || {}),
    extras: normalizeExtras(body.inning1?.extras),
  };
  body.inning2 = {
    ...(body.inning2 || {}),
    extras: normalizeExtras(body.inning2?.extras),
  };
  return body;
};

// Create new match
exports.createMatch = async (req, res) => {
  try {
    const match = new Live(normalizeLivePayload(req.body));
    await match.save();
    res.status(201).json({ message: "Match created", match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Live.find();
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Live.findById(id).lean();

    if (!match) {
      return res.status(404).json({ message: 'Score not found' });
    }

    res.status(200).json(match);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid score ID format' });
    }

    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get match by matchId
exports.getMatchByMatchId = async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId, 10);
    const match = await Live.findOne({ matchId });
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update match by matchId
exports.updateMatchByMatchId = async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId, 10);
    const match = await Live.findOne({ matchId });
    if (!match) return res.status(404).json({ error: "Match not found" });
    Object.assign(match, normalizeLivePayload(req.body));
    await match.save();
    res.json({ message: "Match updated", match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Count all matches
exports.countData = async (req, res) => {
  try {
    const count = await Live.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to count matches." });
  }
};

// Delete the match where matchId === total count and hasMatchEnded === false
exports.deleteLatestUnendedMatch = async (req, res) => {
  try {
    // Step 1: Count total matches
    const totalCount = await Live.countDocuments();

    if (totalCount === 0) {
      return res.status(404).json({ message: "No matches found in the database." });
    }

    // Step 2: Find the match with matchId = totalCount
    const latestMatch = await Live.findOne({ matchId: totalCount });

    if (!latestMatch) {
      return res.status(404).json({ message: `No match found with matchId=${totalCount}.` });
    }

    // Step 3: If the match has already ended, do not delete. Just return a success-like message.
    if (latestMatch.hasMatchEnded) {
      return res.status(200).json({
        message: `Match with matchId=${totalCount} has already ended. No deletion performed.`,
        match: latestMatch,
      });
    }

    // Step 4: Delete only if match hasn't ended
    const deletedMatch = await Live.findOneAndDelete({
      matchId: totalCount,
      hasMatchEnded: false,
    });

    return res.status(200).json({
      message: `Match with matchId=${totalCount} deleted successfully.`,
      deletedMatch,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete match.",
      error: error.message,
    });
  }
};

exports.deleteMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request for ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid match ID format' });
    }

    const deleted = await Live.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'match not found' });
    }

    res.status(200).json({ message: 'match deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
};