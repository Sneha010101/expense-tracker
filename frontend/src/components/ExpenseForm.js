import { useState } from "react";
import API from "../api/axios";

const ExpenseForm = ({ fetchExpenses }) => {
  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/expenses", expense);
      fetchExpenses();
      setExpense({ title: "", amount: "", category: "", date: "", notes: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <input placeholder="Title" onChange={(e) => setExpense({ ...expense, title: e.target.value })} />
      <input placeholder="Amount" onChange={(e) => setExpense({ ...expense, amount: e.target.value })} />
      <input placeholder="Category" onChange={(e) => setExpense({ ...expense, category: e.target.value })} />
      <input type="date" onChange={(e) => setExpense({ ...expense, date: e.target.value })} />
      <input placeholder="Notes" onChange={(e) => setExpense({ ...expense, notes: e.target.value })} />
      <button>Add Expense</button>
    </form>
  );
};

export default ExpenseForm;