const express = require("express");
const router = express.Router();
const liveController = require("../controllers/LiveController");

router.post("/create", liveController.createMatch);
router.get("/count", liveController.countData);
router.get("/match/all",liveController.getAllMatches);
router.get("/:id", liveController.getMatchById);
router.get("/match/:matchId", liveController.getMatchByMatchId);
router.patch("/match/:matchId/update", liveController.updateMatchByMatchId);
router.delete("/delete/latest-unended", liveController.deleteLatestUnendedMatch);
router.delete("/delete/:id", liveController.deleteMatchById);

module.exports = router;
