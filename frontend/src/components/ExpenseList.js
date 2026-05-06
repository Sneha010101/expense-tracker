import API from "../api/axios";

const ExpenseList = ({ expenses, fetchExpenses }) => {
  const deleteExpense = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete expense");
    }
  };

  return (
    <div>
      {expenses.map((exp) => (
        <div key={exp._id} className="expense-item">
          <div>
            <h4>{exp.title}</h4>
            <p>{exp.category}</p>
            <p>{new Date(exp.date).toLocaleDateString()}</p>
          </div>

          <div>
            <h3>₹{exp.amount}</h3>
            <button className="delete-btn" onClick={() => deleteExpense(exp._id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;