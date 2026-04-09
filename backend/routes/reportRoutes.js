const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { downloadReport } = require("../controllers/reportController");

router.get("/download/:range", authMiddleware, downloadReport);

module.exports = router;