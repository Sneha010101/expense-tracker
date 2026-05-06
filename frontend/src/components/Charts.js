import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Charts = ({ expenses }) => {
  const categories = {};

  expenses.forEach((exp) => {
    categories[exp.category] =
      (categories[exp.category] || 0) + exp.amount;
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
      },
    ],
  };

  return (
    <div className="card">
      <h3>Expense Chart</h3>
      <Pie data={data} />
    </div>
  );
};

export default Charts;