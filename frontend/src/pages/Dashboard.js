import { useEffect, useState } from "react";
import API from "../api/axios";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import Charts from "../components/Charts";
import DownloadReport from "../components/DownloadReport";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const total = expenses.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="dashboard">
      <div className="card">
        <h2>Total Expenses</h2>
        <h1>₹{total}</h1>
      </div>

      <div className="card">
        <h3>Add Expense</h3>
        <ExpenseForm fetchExpenses={fetchExpenses} />
      </div>

      <div className="card">
        <h3>Your Expenses</h3>
        <ExpenseList expenses={expenses} fetchExpenses={fetchExpenses} />
        <Charts expenses={expenses} />
        <DownloadReport />
      </div>
    </div>
  );
};

export default Dashboard;