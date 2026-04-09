const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getNews } = require("../controllers/newsController");

router.get("/", authMiddleware, getNews);

module.exports = router;
