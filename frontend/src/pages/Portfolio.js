import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Typography,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Empty,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  PlusOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FundOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import API from "../api/axios";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;

const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Rental",
  "Gift",
  "Other",
];

const CHART_COLORS = {
  income: "#52c41a",
  incomeBg: "rgba(82, 196, 26, 0.15)",
  expense: "#ff4d4f",
  expenseBg: "rgba(255, 77, 79, 0.15)",
  balance: "#1890ff",
  doughnut: [
    "#5B8FF9",
    "#5AD8A6",
    "#F6BD16",
    "#E86452",
    "#6DC8EC",
    "#945FB9",
    "#FF9845",
    "#1E9493",
    "#FF99C3",
  ],
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/portfolio");
      setPortfolio(res.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    // Poll every 30 seconds for real-time feel
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  const handleAddIncome = async (values) => {
    try {
      await API.post("/incomes", {
        ...values,
        date: values.date.toISOString(),
      });
      message.success("Income added successfully!");
      setIncomeModalOpen(false);
      form.resetFields();
      fetchPortfolio();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to add income");
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await API.delete(`/incomes/${id}`);
      message.success("Income deleted");
      fetchPortfolio();
    } catch (error) {
      message.error("Failed to delete income");
    }
  };

  if (loading && !portfolio) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" tip="Loading your portfolio..." />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Empty description="Could not load portfolio data" />
      </div>
    );
  }

  // === CHART DATA ===
  const monthlyLabels = portfolio.monthlyData.map((m) => {
    const [year, month] = m.month.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
  });

  const incomeExpenseLineData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Income",
        data: portfolio.monthlyData.map((m) => m.income),
        borderColor: CHART_COLORS.income,
        backgroundColor: CHART_COLORS.incomeBg,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Spending",
        data: portfolio.monthlyData.map((m) => m.expense),
        borderColor: CHART_COLORS.expense,
        backgroundColor: CHART_COLORS.expenseBg,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const barData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Income",
        data: portfolio.monthlyData.map((m) => m.income),
        backgroundColor: CHART_COLORS.income,
        borderRadius: 6,
      },
      {
        label: "Spending",
        data: portfolio.monthlyData.map((m) => m.expense),
        backgroundColor: CHART_COLORS.expense,
        borderRadius: 6,
      },
    ],
  };

  const expenseDoughnutData = {
    labels: Object.keys(portfolio.expenseByCategory),
    datasets: [
      {
        data: Object.values(portfolio.expenseByCategory),
        backgroundColor: CHART_COLORS.doughnut,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.1)",
      },
    ],
  };

  const incomeDoughnutData = {
    labels: Object.keys(portfolio.incomeBySource),
    datasets: [
      {
        data: Object.values(portfolio.incomeBySource),
        backgroundColor: CHART_COLORS.doughnut,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.1)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#fff", font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#ccc" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: {
          color: "#ccc",
          callback: (val) => `₹${val.toLocaleString("en-IN")}`,
        },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#fff", padding: 15, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ₹${ctx.raw.toLocaleString("en-IN")}`,
        },
      },
    },
  };

  // Recent transactions table columns
  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "income" ? "green" : "red"} style={{ textTransform: "capitalize" }}>
          {type === "income" ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {type}
        </Tag>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text style={{ color: "#fff" }}>{text}</Text>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <Text style={{ color: record.type === "income" ? "#52c41a" : "#ff4d4f", fontWeight: 600 }}>
          {record.type === "income" ? "+" : "-"}₹{amount?.toLocaleString("en-IN")}
        </Text>
      ),
    },
    {
      title: "Category",
      key: "category",
      render: (_, record) => (
        <Tag color="blue">{record.category || record.source || "-"}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.type === "income" ? (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteIncome(record._id)}
          />
        ) : null,
    },
  ];

  return (
    <div className="portfolio-page">
      {/* Header */}
      <div className="portfolio-header">
        <div>
          <AntTitle level={2} style={{ color: "#fff", margin: 0 }}>
            <FundOutlined /> My Portfolio
          </AntTitle>
          <Text style={{ color: "rgba(255,255,255,0.65)" }}>
            Real-time financial overview
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIncomeModalOpen(true)}
          style={{
            background: "linear-gradient(45deg, #52c41a, #73d13d)",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          Add Income
        </Button>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="portfolio-stat-card stat-income">
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)" }}>Total Income</span>}
              value={portfolio.totalIncome}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: 28, fontWeight: 700 }}
              formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
            />
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              {portfolio.incomeCount} transactions
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="portfolio-stat-card stat-expense">
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)" }}>Total Spending</span>}
              value={portfolio.totalExpense}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#ff4d4f", fontSize: 28, fontWeight: 700 }}
              formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
            />
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              {portfolio.expenseCount} transactions
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="portfolio-stat-card stat-balance">
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)" }}>Balance</span>}
              value={portfolio.balance}
              prefix={<WalletOutlined />}
              valueStyle={{
                color: portfolio.balance >= 0 ? "#52c41a" : "#ff4d4f",
                fontSize: 28,
                fontWeight: 700,
              }}
              formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
            />
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              Net savings
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Income vs Spending — Line Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ color: "#fff" }}>Income vs Spending Trend</span>}
            className="portfolio-chart-card"
          >
            <div style={{ height: 320 }}>
              <Line data={incomeExpenseLineData} options={chartOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ color: "#fff" }}>Monthly Comparison</span>}
            className="portfolio-chart-card"
          >
            <div style={{ height: 320 }}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Doughnut Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ color: "#fff" }}>Spending by Category</span>}
            className="portfolio-chart-card"
          >
            <div style={{ height: 280 }}>
              {Object.keys(portfolio.expenseByCategory).length > 0 ? (
                <Doughnut data={expenseDoughnutData} options={doughnutOptions} />
              ) : (
                <Empty description="No expenses yet" style={{ color: "#999" }} />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ color: "#fff" }}>Income by Source</span>}
            className="portfolio-chart-card"
          >
            <div style={{ height: 280 }}>
              {Object.keys(portfolio.incomeBySource).length > 0 ? (
                <Doughnut data={incomeDoughnutData} options={doughnutOptions} />
              ) : (
                <Empty description="No income yet" style={{ color: "#999" }} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions Table */}
      <Card
        title={<span style={{ color: "#fff" }}>Recent Transactions</span>}
        className="portfolio-chart-card"
      >
        <Table
          dataSource={portfolio.recentTransactions}
          columns={columns}
          rowKey="_id"
          pagination={false}
          style={{ background: "transparent" }}
          className="portfolio-table"
        />
      </Card>

      {/* Add Income Modal */}
      <Modal
        title="Add Income"
        open={incomeModalOpen}
        onCancel={() => {
          setIncomeModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        className="portfolio-modal"
      >
        <Form form={form} onFinish={handleAddIncome} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. March Salary" />
          </Form.Item>

          <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true }]}>
            <Input type="number" placeholder="50000" />
          </Form.Item>

          <Form.Item name="source" label="Source" rules={[{ required: true }]}>
            <Select placeholder="Select source">
              {INCOME_SOURCES.map((src) => (
                <Option key={src} value={src}>
                  {src}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker
              style={{ width: "100%" }}
              defaultValue={dayjs()}
            />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea placeholder="Optional notes" rows={2} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{
              background: "linear-gradient(45deg, #52c41a, #73d13d)",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            Add Income
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Portfolio;
