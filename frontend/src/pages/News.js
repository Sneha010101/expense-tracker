import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Spin,
  Empty,
  Button,
} from "antd";
import {
  ReloadOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import API from "../api/axios";

const { Title: AntTitle, Text } = Typography;

const SOURCE_COLORS = {
  "Economic Times": "gold",
  "ET Wealth": "orange",
  "LiveMint": "green",
  "MoneyControl": "blue",
};

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/news");
      setArticles(res.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" tip="Fetching latest financial news..." />
      </div>
    );
  }

  return (
    <div className="news-page">
      {/* Header */}
      <div className="news-header">
        <div>
          <AntTitle level={2} style={{ color: "var(--text-primary)", margin: 0 }}>
            <ReadOutlined /> Financial News
          </AntTitle>
          <Text style={{ color: "var(--text-secondary)" }}>
            Latest updates from Economic Times, LiveMint, MoneyControl & more
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchNews}
          loading={loading}
          size="large"
          style={{
            background: "var(--glass-bg-light)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-primary)",
            borderRadius: 10,
          }}
        >
          Refresh
        </Button>
      </div>

      {articles.length === 0 ? (
        <Empty description="No news available at the moment" />
      ) : (
        <Row gutter={[16, 16]}>
          {articles.map((article, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card className="news-card" hoverable>
                <Card.Meta
                  title={article.title}
                  description={article.description || "No description available."}
                />

                <div className="news-meta" style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag
                      color={SOURCE_COLORS[article.source] || "default"}
                      className="news-source-tag"
                    >
                      {article.source}
                    </Tag>
                    <Tag color="purple" className="news-source-tag">
                      {article.category}
                    </Tag>
                  </div>

                  <Text style={{ color: "var(--news-meta-color)", fontSize: 11 }}>
                    <ClockCircleOutlined /> {timeAgo(article.pubDate)}
                  </Text>
                </div>

                <div style={{ marginTop: 12 }}>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-link"
                  >
                    <LinkOutlined /> Read full article →
                  </a>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default News;
