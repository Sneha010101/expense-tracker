import { useState } from "react";
import API from "../api/axios";
import "./DownloadReport.css";


const DownloadReport = () => {
  const [range, setRange] = useState("month");

  const download = async () => {
    try {
      const res = await API.get(`/reports/download/${range}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense-report.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Failed to download report");
    }
  };

  return (
    <div className="report-card">
      <h3 className="report-title">Download Expense Report</h3>

      <select
        className="report-dropdown"
        value={range}
        onChange={(e) => setRange(e.target.value)}
      >
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="3month">Last 3 Months</option>
        <option value="6month">Last 6 Months</option>
        <option value="year">Last Year</option>
      </select>

      <button className="report-btn" onClick={download}>
        Download PDF
      </button>
    </div>
  );
};

export default DownloadReport;