    const express = require("express");
    const router = express.Router();
    const matchController = require("../controllers/matchController");

    router.post("/", matchController.createMatch);
    router.get("/", matchController.getAllMatches);
    router.get("/:id", matchController.getMatch);
    router.patch('/:matchId/toggle', matchController.toggleNewMatch);
    router.patch("/:matchId/type", matchController.updateMatchType);
    router.delete("/delete/:id", matchController.deleteMatch);

    module.exports = router;
