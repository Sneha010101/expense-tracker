const Expense = require("../models/Expense");

// Whitelist of allowed fields to prevent mass-assignment attacks
const ALLOWED_FIELDS = ["title", "amount", "category", "date", "notes"];

const sanitizeInput = (body) => {
  const sanitized = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      sanitized[field] = body[field];
    }
  });
  return sanitized;
};

exports.addExpense = async (req, res) => {
  try {
    const data = sanitizeInput(req.body);

    if (!data.title || !data.amount) {
      return res.status(400).json({ message: "Title and amount are required" });
    }

    const expense = await Expense.create({
      ...data,
      userId: req.user,
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const data = sanitizeInput(req.body);

    // SECURITY: Only update expenses that belong to the authenticated user
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      data,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    // SECURITY: Only delete expenses that belong to the authenticated user
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};