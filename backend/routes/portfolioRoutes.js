const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getPortfolio } = require("../controllers/portfolioController");

router.get("/", authMiddleware, getPortfolio);

module.exports = router;
