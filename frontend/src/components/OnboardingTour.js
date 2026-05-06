import { useState, useEffect, useRef } from "react";
import { Tour, Button } from "antd";
import { RocketOutlined } from "@ant-design/icons";

const ONBOARDING_KEY = "expense_tracker_onboarding_seen";

const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const dummyRef = useRef(null);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      // Delay to let the page render and refs to be available
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  const steps = [
    {
      title: "👋 Welcome to Expense Tracker!",
      description:
        "Let's take a quick tour to help you get started. This will only take 30 seconds!",
      target: null,
    },
    {
      title: "📊 Dashboard",
      description:
        "This is your home base. Add expenses, view your spending history, and see charts of your spending patterns.",
      target: () => document.getElementById("nav-dashboard"),
    },
    {
      title: "💼 My Portfolio",
      description:
        "Track both income and expenses here. View monthly trends, category breakdowns, and your overall financial health with beautiful charts.",
      target: () => document.getElementById("nav-portfolio"),
    },
    {
      title: "📰 Financial News",
      description:
        "Stay updated with the latest financial news from Economic Times, LiveMint, MoneyControl, and more — all in one place.",
      target: () => document.getElementById("nav-news"),
    },
    {
      title: "🎨 Theme Toggle",
      description:
        "Prefer a lighter look? Click here to switch between dark and light mode. Your preference is saved automatically.",
      target: () => document.querySelector(".theme-toggle"),
    },
    {
      title: "🚀 You're All Set!",
      description:
        "Start by adding your first expense on the Dashboard, or add your income in My Portfolio. Happy tracking!",
      target: null,
    },
  ];

  return (
    <>
      <span ref={dummyRef} />
      <Tour
        open={open}
        onClose={handleClose}
        steps={steps}
        indicatorsRender={(current, total) => (
          <span style={{ color: "#999", fontSize: 12 }}>
            {current + 1} / {total}
          </span>
        )}
      />
    </>
  );
};

// Button to re-trigger the tour manually
export const RestartTourButton = () => {
  const handleRestart = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    window.location.reload();
  };

  return (
    <Button
      type="text"
      icon={<RocketOutlined />}
      onClick={handleRestart}
      style={{
        color: "var(--text-secondary)",
        fontSize: 12,
      }}
    >
      Restart Tour
    </Button>
  );
};

export default OnboardingTour;
