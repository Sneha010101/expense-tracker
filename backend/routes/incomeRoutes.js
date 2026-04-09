const express = require("express");
const {
  addIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
} = require("../controllers/incomeController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addIncome);
router.get("/", authMiddleware, getIncomes);
router.put("/:id", authMiddleware, updateIncome);
router.delete("/:id", authMiddleware, deleteIncome);

module.exports = router;
