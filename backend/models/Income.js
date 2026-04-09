const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: ["Salary", "Freelance", "Business", "Investment", "Rental", "Gift", "Other"],
  },
  date: {
    type: Date,
    required: true,
  },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model("Income", incomeSchema);
