const Income = require("../models/Income");
const Expense = require("../models/Expense");

exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user;

    const incomes = await Income.find({ userId }).sort({ date: -1 });
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const balance = totalIncome - totalExpense;

    // Monthly breakdown for charts (last 12 months)
    const monthlyData = {};
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { month: key, income: 0, expense: 0 };
    }

    incomes.forEach((inc) => {
      const d = new Date(inc.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        monthlyData[key].income += inc.amount || 0;
      }
    });

    expenses.forEach((exp) => {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        monthlyData[key].expense += exp.amount || 0;
      }
    });

    // Category breakdown for expenses
    const expenseByCategory = {};
    expenses.forEach((exp) => {
      const cat = exp.category || "Uncategorized";
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + (exp.amount || 0);
    });

    // Source breakdown for income
    const incomeBySource = {};
    incomes.forEach((inc) => {
      const src = inc.source || "Other";
      incomeBySource[src] = (incomeBySource[src] || 0) + (inc.amount || 0);
    });

    // Recent transactions (combined, last 10)
    const allTransactions = [
      ...incomes.map((i) => ({ ...i._doc, type: "income" })),
      ...expenses.map((e) => ({ ...e._doc, type: "expense" })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      totalIncome,
      totalExpense,
      balance,
      monthlyData: Object.values(monthlyData),
      expenseByCategory,
      incomeBySource,
      recentTransactions: allTransactions,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Portfolio fetch error" });
  }
};
