const express = require("express");
const router = express.Router();
const songController = require("../controllers/song.controller");

router.get("/songs", songController.getAllSongs);

router.post("/songs", songController.createSong);
router.get("/songs/with-category", songController.getSongsWithCategories);

module.exports = router;
