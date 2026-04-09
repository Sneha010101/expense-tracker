const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  amount: Number,
  category: String,
  date: Date,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);