const Parser = require("rss-parser");
const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "ExpenseTracker/1.0",
  },
});

// Financial news RSS feeds (Indian + Global)
const RSS_FEEDS = [
  {
    url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    source: "Economic Times",
    category: "Markets",
  },
  {
    url: "https://economictimes.indiatimes.com/wealth/personal-finance-news/rssfeeds/49279828.cms",
    source: "ET Wealth",
    category: "Personal Finance",
  },
  {
    url: "https://www.livemint.com/rss/markets",
    source: "LiveMint",
    category: "Markets",
  },
  {
    url: "https://www.moneycontrol.com/rss/latestnews.xml",
    source: "MoneyControl",
    category: "Finance",
  },
];

// Cache news for 10 minutes to avoid hammering RSS feeds
let newsCache = {
  data: [],
  lastFetch: 0,
};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

exports.getNews = async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if still fresh
    if (newsCache.data.length > 0 && now - newsCache.lastFetch < CACHE_DURATION) {
      return res.json(newsCache.data);
    }

    const allArticles = [];

    // Fetch all feeds concurrently
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.slice(0, 8).map((item) => ({
          title: item.title || "Untitled",
          description: (item.contentSnippet || item.content || "")
            .replace(/<[^>]*>/g, "")
            .substring(0, 200),
          link: item.link || "",
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          source: feed.source,
          category: feed.category,
          image: item.enclosure?.url || item["media:content"]?.$.url || null,
        }));
      } catch (err) {
        console.log(`Failed to fetch ${feed.source}:`, err.message);
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allArticles.push(...result.value);
      }
    });

    // Sort by date, newest first
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Cache the results
    newsCache = {
      data: allArticles.slice(0, 30), // Keep top 30
      lastFetch: now,
    };

    res.json(newsCache.data);
  } catch (error) {
    console.log("News fetch error:", error);
    res.status(500).json({ message: "Failed to fetch news" });
  }
};
