const mongoose = require('mongoose');
const Score = require('../models/Score'); // ✅ This must be at the top

// Save score
exports.saveScore = async (req, res) => {
  try {
    const score = new Score(req.body);
    await score.save();
    res.status(201).json({ message: 'Score saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get score 
exports.getScore = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Score.findById(id).lean();

    if (!result) {
      return res.status(404).json({ message: 'Score not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid score ID format' });
    }

    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get scores 
exports.getScores = async (req, res) => {
  try {
    const scores = await Score.find().sort({ _id: -1 }); // Latest first
    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete score by ID
exports.deleteScore = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request for ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid score ID format' });
    }

    const deleted = await Score.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Score not found' });
    }

    res.status(200).json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
};
