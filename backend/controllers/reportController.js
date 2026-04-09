const Expense = require("../models/Expense");
const generatePDF = require("../utils/generatePDF");

exports.downloadReport = async (req, res) => {
  const { range } = req.params;
  const userId = req.user;
  let date = new Date();

  if (range === "week") date.setDate(date.getDate() - 7);
  if (range === "month") date.setMonth(date.getMonth() - 1);
  if (range === "3month") date.setMonth(date.getMonth() - 3);
  if (range === "6month") date.setMonth(date.getMonth() - 6);
  if (range === "year") date.setFullYear(date.getFullYear() - 1);

  const expenses = await Expense.find({
    userId,
    date: { $gte: date },
  });

  generatePDF(expenses, res, range);
};