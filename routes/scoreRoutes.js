// routes/scoreRoutes.js
const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const Score = require("../models/Score");


router.post('/save', scoreController.saveScore);
router.get('/all', scoreController.getScores);
router.get('/:id', scoreController.getScore);
router.delete('/delete/:id', scoreController.deleteScore);

module.exports = router;
