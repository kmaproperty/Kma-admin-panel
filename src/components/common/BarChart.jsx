import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const BarChart = ({
  title,
  subtitle,
  data = {},
  tabs,
  defaultTab,
  color = "#7C3AED",
  tooltipSuffix = "",
  height = 320,
  columnWidth = "55%",
  borderRadius = 6,
  seriesName = "Value",
  onTabChange,
}) => {
  const tabKeys = tabs ?? Object.keys(data);
  const firstTab = defaultTab ?? tabKeys[0];
  const [activeTab, setActiveTab] = useState(firstTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const currentData = data[activeTab] ?? [];
  const categories = currentData.map((d) => d.category);
  const values = currentData.map((d) => d.value);

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeinout", speed: 400 },
    },
    plotOptions: {
      bar: {
        borderRadius,
        columnWidth,
        dataLabels: { position: "top" },
      },
    },
    colors: [color],
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "13px",
          fontFamily: "inherit",
          fontWeight: 400,
        },
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 6,
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
          fontFamily: "inherit",
        },
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => `${val}${tooltipSuffix ? " " + tooltipSuffix : ""}`,
      },
      style: { fontFamily: "inherit" },
    },
    states: {
      hover: { filter: { type: "darken", value: 0.85 } },
    },
  };

  const series = [{ name: seriesName, data: values }];
  const showTabs = tabKeys.length > 1;

  return (
    <div style={styles.card}>
      
      <div style={styles.header}>
        <div>
          {title && <h2 style={styles.title}>{title}</h2>}
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* ── Tab toggle ── */}
        {showTabs && (
          <div style={styles.tabGroup}>
            {tabKeys.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  ...styles.tabBtn,
                  background: activeTab === tab ? "#ffffff" : "transparent",
                  color: activeTab === tab ? color : "#6B7280",
                  boxShadow:
                    activeTab === tab ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      <div style={{ marginTop: "12px" }}>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={height}
        />
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px 28px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)",
    fontFamily: "'Geist', sans-serif",
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
    color: "#111827",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#9CA3AF",
    fontWeight: 400,
  },
  tabGroup: {
    display: "flex",
    background: "#F3F4F6",
    borderRadius: "10px",
    padding: "3px",
    gap: "2px",
  },
  tabBtn: {
    padding: "6px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    textTransform: "capitalize",
  },
};

export default BarChart;