const mongoose = require('mongoose');
const Match = require("../models/Match");

// Create new match
exports.createMatch = async (req, res) => {
  try {
    console.log("Incoming Data from frontend:", req.body);
    const matchData = {
      ...req.body,
    };
    const match = new Match(matchData);
    const savedMatch = await match.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all matches
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find();
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id).lean();

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

// Update match field(s) by ID
// Toggle 'newmatch' field
// In your matchController.js

exports.toggleNewMatch = async (req, res) => {
  const { matchId } = req.params;
  const { newmatch } = req.body; // get newmatch value from request body
  // console.log("Received matchId:", matchId); // add this
  try {
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { newmatch }, // update newmatch with sent value
      { new: true } // return updated doc
    );

    // console.log(updatedMatch)

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMatchType = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { matchType } = req.body;

    const allowedTypes = ['Normal', 'Final', 'Qualifier 2','Qualifier 1','Eliminator', 'SuperOver'];

    if (!allowedTypes.includes(matchType)) {
      return res.status(400).json({ message: "Invalid matchType" });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { matchType },
      { new: true, runValidators: true }
    );

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json({
      message: "Match type updated successfully",
      data: updatedMatch,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request for ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid match ID format' });
    }

    const deleted = await Match.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'match not found' });
    }

    res.status(200).json({ message: 'match deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
};