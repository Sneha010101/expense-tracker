const Income = require("../models/Income");

exports.addIncome = async (req, res) => {
  try {
    const { title, amount, source, date, notes } = req.body;

    if (!title || !amount || !source || !date) {
      return res.status(400).json({ message: "Title, amount, source, and date are required" });
    }

    const income = await Income.create({
      title,
      amount,
      source,
      date,
      notes,
      userId: req.user,
    });

    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      req.body,
      { new: true }
    );

    if (!income) return res.status(404).json({ message: "Income not found" });

    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });

    if (!income) return res.status(404).json({ message: "Income not found" });

    res.json({ message: "Income deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
