import React, { useState, useEffect, useRef, Suspense, memo, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronDown, faChevronUp, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./EmployeeDetail.css";
import Chart from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import moment from "moment";

// Register the annotation plugin
Chart.register(annotationPlugin);

// Mock meetings data (not used but kept for reference)
const mockMeetings = {
  "britt.burney@example.com": [
    {
      id: "meeting1",
      summary: "Client Sync",
      description: "Discuss project updates",
      start: { dateTime: "2025-05-04T09:00:00Z", timeZone: "America/New_York" },
      end: { dateTime: "2025-05-04T10:00:00Z", timeZone: "America/New_York" },
      attendees: [
        { email: "britt.burney@example.com" },
        { email: "mock.user@example.com" },
      ],
    },
  ],
  "jack.schultz@example.com": [
    {
      id: "meeting2",
      summary: "Prospect Call",
      description: "Initial consultation",
      start: { dateTime: "2025-05-04T11:00:00Z", timeZone: "America/New_York" },
      end: { dateTime: "2025-05-04T11:30:00Z", timeZone: "America/New_York" },
      attendees: [
        { email: "jack.schultz@example.com" },
        { email: "mock.user@example.com" },
      ],
    },
  ],
};

// Cache for meetings (not used but kept for reference)
const dataCache = {
  meetings: mockMeetings,
  timestamp: Date.now(),
  CACHE_DURATION: 15 * 60 * 1000,
  isValid() {
    return this.timestamp && Date.now() - this.timestamp < this.CACHE_DURATION;
  },
  setMeetings(meetings) {
    this.meetings = meetings || {};
    this.timestamp = Date.now();
  },
  clear() {
    this.meetings = {};
    this.timestamp = null;
  },
};

// Mock Auth
const Auth = {
  currentAuthenticatedUser: async () => ({
    attributes: {
      email: "mock.user@example.com",
      given_name: "Mock",
      family_name: "User",
    },
  }),
  currentSession: async () => ({
    isValid: () => true,
    getIdToken: () => ({
      getJwtToken: () => "mock-jwt-token",
    }),
  }),
};

// Skeleton UI Component
const SkeletonUI = () => (
  <div className="taq-effort-content">
    <div className="ps-detailed-page active">
      <div className="ps-skeleton ps-skeleton-detail" />
    </div>
  </div>
);

// Main Component Content
const EmployeeDetailContent = memo(function EmployeeDetailContent({
  selectedEmployee,
  employees = [],
  loggedTasks = [],
  timeframeMode = "total",
  actionMode = "total",
  onTimeframeChange = () => {},
  onActionChange = () => {},
  onClose = () => {},
}) {
  const [expandedEntry, setExpandedEntry] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const navigate = useNavigate();

  // Dynamic Chain of Thought data
  const chainOfThoughtData = useMemo(() => {
    if (!selectedEmployee) return [];

    const employee = employees.find(
      (emp) => `${emp.firstName} ${emp.lastName}`.trim() === selectedEmployee
    );
    if (!employee || !employee.activityMetrics) return [];

    const metrics = employee.activityMetrics[timeframeMode]?.counts || {
      calls: { logged: 0, target: 0 },
      emails: { logged: 0, target: 0 },
      meetings: { logged: 0, target: 0 },
    };

    const employeeTasks = loggedTasks.find(
      (task) => task.employeeName === selectedEmployee
    )?.tasks || [];

    const entries = [];
    const isBrittBurney = selectedEmployee === "Britt Burney";

    const recentDates = [
      moment().subtract(1, "days").format("dddd, M/D/YYYY"),
      moment().format("dddd, M/D/YYYY"),
    ];

    recentDates.forEach((date, index) => {
      const entry = {
        date,
        performance: "",
        details: null,
        progress: { blue: 0, green: 0, gray: 0 },
      };

      const completionRates = {
        calls: metrics.calls.target > 0 ? (metrics.calls.logged / metrics.calls.target) * 100 : 0,
        emails: metrics.emails.target > 0 ? (metrics.emails.logged / metrics.emails.target) * 100 : 0,
        meetings: metrics.meetings.target > 0 ? (metrics.meetings.logged / metrics.meetings.target) * 100 : 0,
      };
      const avgCompletion = Object.values(completionRates).reduce((sum, rate) => sum + rate, 0) / 3;

      if (isBrittBurney) {
        entry.performance = index === 0
          ? "Outstanding performance in both quality and quantity. Exceeded all targets."
          : "Continued excellence, surpassing expectations in all metrics.";
        entry.details = index === 0
          ? "Consistently delivered high-quality results, demonstrating strong motivation and dedication."
          : "Maintained high productivity and quality, setting a positive example for the team.";
        entry.progress = index === 0
          ? { blue: 80, green: 20, gray: 0 }
          : { blue: 85, green: 15, gray: 0 };
      } else {
        const tasksOnDate = employeeTasks.filter(
          (task) => moment(task.logHistory[0]?.timestamp).format("M/D/YYYY") === date.split(", ")[1]
        );
        const dealsClosed = tasksOnDate.reduce(
          (sum, task) => sum + (task.actionKey === "closed_won" ? task.logHistory.length : 0),
          0
        );

        if (avgCompletion >= 100) {
          entry.performance = `Both quality and quantity exceeded expectations. Closed ${dealsClosed} deal(s).`;
          entry.progress = { blue: 60, green: 30, gray: 10 };
        } else {
          entry.performance = `Both quality and quantity below expectations. Achieved ${Math.round(avgCompletion)}% of targets.`;
          entry.progress = { blue: 40, green: 20, gray: 40 };
        }

        if (dealsClosed > 0) {
          entry.details = `Closed ${dealsClosed} deal(s) on this date.`;
        }
      }

      entries.push(entry);
    });

    if (entries.length === 0) {
      return isBrittBurney
        ? [
            {
              date: "Thursday, 5/4/2025",
              performance: "Outstanding performance in both quality and quantity. Exceeded all targets.",
              details: "Consistently delivered high-quality results, demonstrating strong motivation and dedication.",
              progress: { blue: 80, green: 20, gray: 0 },
            },
            {
              date: "Friday, 5/5/2025",
              performance: "Continued excellence, surpassing expectations in all metrics.",
              details: "Maintained high productivity and quality, setting a positive example for the team.",
              progress: { blue: 85, green: 15, gray: 0 },
            },
          ]
        : [
            {
              date: "Thursday, 5/4/2025",
              performance: "Both quality and quantity failed. Inconsistent with past week’s performance, likely motivational.",
              details: "Noted that there were family issues going on at the time.",
              progress: { blue: 40, green: 20, gray: 40 },
            },
            {
              date: "Friday, 5/5/2025",
              performance: "Both quality and quantity exceeded expectations. Likely to make up for 5/4/2025.",
              details: null,
              progress: { blue: 60, green: 30, gray: 10 },
            },
          ];
    }

    return entries;
  }, [selectedEmployee, employees, loggedTasks, timeframeMode]);

  // Calculate completion rate based on actionMode
  const calculateCompletionRate = (metrics) => {
    if (!metrics) return 0;
    if (actionMode === "total") {
      const { calls, emails, meetings } = metrics;
      const rates = [
        calls?.target > 0 ? (calls.logged / calls.target) * 100 : 0,
        emails?.target > 0 ? (emails.logged / emails.target) * 100 : 0,
        meetings?.target > 0 ? (meetings.logged / meetings.target) * 100 : 0,
      ].filter((rate) => rate > 0);
      return rates.length > 0
        ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length)
        : 0;
    }
    const metric = metrics[actionMode];
    return metric?.target > 0
      ? Math.round((metric.logged / metric.target) * 100)
      : 0;
  };

  // Calculate ranking metrics
  const calculateRankingMetrics = (employee) => {
    const metrics = employee?.activityMetrics?.[timeframeMode]?.counts || {
      calls: { logged: 0, target: 0 },
      emails: { logged: 0, target: 0 },
      meetings: { logged: 0, target: 0 },
    };
    const dailyMetrics = employee?.activityMetrics?.[timeframeMode]?.daily || {
      calls: [0, 0, 0, 0, 0, 0, 0],
      emails: [0, 0, 0, 0, 0, 0, 0],
      meetings: [0, 0, 0, 0, 0, 0, 0],
    };

    const quantityScore =
      ([
        metrics.calls?.logged >= metrics.calls?.target ? 1 : 0,
        metrics.emails?.logged >= metrics.emails?.target ? 1 : 0,
        metrics.meetings?.logged >= metrics.meetings?.target ? 1 : 0,
      ].reduce((sum, val) => sum + val, 0) /
        3) *
      100;

    const qualityScore = calculateCompletionRate(metrics);

    const dailyTotals = dailyMetrics.calls.map(
      (call, i) => call + dailyMetrics.emails[i] + dailyMetrics.meetings[i]
    );
    const mean =
      dailyTotals.reduce((sum, val) => sum + val, 0) / dailyTotals.length || 1;
    const variance =
      dailyTotals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      dailyTotals.length;
    const stdDev = Math.sqrt(variance);
    const maxValue = Math.max(...dailyTotals, mean * 7);
    const maxPossibleStdDev = Math.sqrt(
      (6 * Math.pow(0 - mean, 2) + Math.pow(maxValue - mean, 2)) / 7
    );
    const consistencyScore = maxPossibleStdDev
      ? 100 * (1 - stdDev / maxPossibleStdDev)
      : 100;
    const normalizedConsistency = Math.max(0, Math.min(100, consistencyScore));

    const overallScore =
      0.4 * quantityScore + 0.4 * qualityScore + 0.2 * normalizedConsistency;

    return {
      quantity: Math.round(quantityScore),
      quality: Math.round(qualityScore),
      consistency: Math.round(normalizedConsistency),
      overall: Math.round(overallScore),
    };
  };

  // Simulate daily data if not available
  const simulateDailyData = (logged, days = 7) => {
    const base = Math.floor(logged / days);
    const remainder = logged % days;
    return Array.from({ length: days }, (_, i) =>
      i < remainder ? base + 1 : base
    );
  };

  // Chart setup
  const chartData = useMemo(() => {
    if (!selectedEmployee) return null;

    const employee = employees.find(
      (emp) => `${emp.firstName} ${emp.lastName}`.trim() === selectedEmployee
    );
    const metrics = employee?.activityMetrics?.[timeframeMode]?.counts || {
      calls: { logged: 0, target: 0 },
      emails: { logged: 0, target: 0 },
      meetings: { logged: 0, target: 0 },
    };
    const dailyMetrics = employee?.activityMetrics?.[timeframeMode]?.daily || {
      calls: simulateDailyData(metrics.calls?.logged || 0),
      emails: simulateDailyData(metrics.emails?.logged || 0),
      meetings: simulateDailyData(metrics.meetings?.logged || 0),
    };

    let dailyTasks;
    if (actionMode === "total") {
      dailyTasks = dailyMetrics.calls.map(
        (call, i) => call + dailyMetrics.emails[i] + dailyMetrics.meetings[i]
      );
    } else {
      dailyTasks = dailyMetrics[actionMode] || [0, 0, 0, 0, 0, 0, 0];
    }

    const dailyTarget =
      actionMode === "total"
        ? ((metrics.calls?.target || 0) +
            (metrics.emails?.target || 0) +
            (metrics.meetings?.target || 0)) /
          7 ||
          80
        : (metrics[actionMode]?.target || 0) / 7 || 80;
    const yMax = Math.max(...dailyTasks, dailyTarget) * 1.2 || 150;

    const getBarColor = (value, target) => {
      if (value < target * 0.15) return "#FF5722";
      return value >= target ? "#66BB6A" : "#007AFF";
    };

    return {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [
        {
          label: `${
            actionMode.charAt(0).toUpperCase() + actionMode.slice(1)
          } Completed by ${selectedEmployee}`,
          data: dailyTasks,
          backgroundColor: (context) =>
            getBarColor(context.dataset.data[context.dataIndex], dailyTarget),
          borderColor: (context) =>
            getBarColor(context.dataset.data[context.dataIndex], dailyTarget),
          borderWidth: 2,
          barThickness: 30,
          borderRadius: 5,
          hoverBackgroundColor: "#66BB6A",
        },
      ],
      dailyTarget,
      yMax,
    };
  }, [selectedEmployee, employees, timeframeMode, actionMode]);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const config = {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 20, bottom: 10, left: 10, right: 10 },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: chartData.yMax,
            ticks: { stepSize: 30, padding: 5 },
            title: {
              display: true,
              text:
                actionMode === "total"
                  ? "Total Actions"
                  : actionMode.charAt(0).toUpperCase() + actionMode.slice(1),
            },
            grid: { drawBorder: false },
          },
          x: {
            title: { display: true, text: "Days", padding: 5 },
            grid: { drawBorder: false },
          },
        },
        plugins: {
          legend: { display: false },
          annotation: {
            annotations: {
              targetLine: {
                type: "line",
                yMin: chartData.dailyTarget,
                yMax: chartData.dailyTarget,
                borderColor: "#b3b3b3",
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  enabled: true,
                  content: `Daily Target: ${chartData.dailyTarget.toFixed(1)}`,
                  position: "start",
                  backgroundColor: "#FF5722",
                  color: "#fff",
                  padding: 4,
                  font: { size: 12 },
                  yAdjust: -10,
                },
              },
            },
          },
        },
      },
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  // Toggle expanded state for Chain of Thought entries
  const toggleEntry = (index) => {
    setExpandedEntry(expandedEntry === index ? null : index);
  };

  return (
    <div className="taq-effort-content">
      {selectedEmployee && (
        <div className="ps-overlay active" onClick={onClose}>
          <div
            className="ps-detailed-page active"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ps-detailed-header">
              <div className="ps-header-column ps-header-back">
                <button
                  className="ps-back-button"
                  onClick={onClose}
                  aria-label="Go back"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="back-icon" />
                  Back
                </button>
              </div>
              <div className="ps-header-column ps-header-title">
                <h2>{selectedEmployee} - Sales Development Representative</h2>
              </div>
              <div className="ps-header-column ps-header-date-picker"></div>
            </div>

            <div className="ps-detailed-content">
              <div className="ps-detailed-column">
                <div className="ps-rating-block">
                  <h3>Summary</h3>
                  <div className="ps-rating-content">
                    {(() => {
                      const employee = employees.find(
                        (emp) =>
                          `${emp.firstName} ${emp.lastName}`.trim() ===
                          selectedEmployee
                      );
                      const rankingMetrics = calculateRankingMetrics(employee);
                      return (
                        <>
                          <div className="ps-summary-headers">
                            <div className="ps-core-problem-header">
                              <span>Core problem</span>
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="ps-warning-icon"
                              />
                            </div>
                            <div className="ps-performance-header">
                              <span>Performance consistency</span>
                            </div>
                          </div>
                          <div className="ps-summary-columns">
                            <div className="ps-core-problem-column">
                              <div
                                className="ps-rating-circle"
                                style={{
                                  background: `conic-gradient(#007AFF 0% ${rankingMetrics.overall}%, #e6e6e6 ${rankingMetrics.overall}% 100%)`,
                                }}
                              >
                                <div className="ps-rating-value">
                                  {rankingMetrics.overall}
                                </div>
                              </div>
                            </div>
                            <div className="ps-performance-column">
                              <div className="ps-rating-metrics">
                                <div className="ps-rating-metric">
                                  <span className="ps-rating-label">Quality</span>
                                  <div className="ps-rating-bar">
                                    <div
                                      className="ps-rating-bar-fill"
                                      style={{
                                        width: `${rankingMetrics.quality}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="ps-rating-metric">
                                  <span className="ps-rating-label">Quantity</span>
                                  <div className="ps-rating-bar">
                                    <div
                                      className="ps-rating-bar-fill"
                                      style={{
                                        width: `${rankingMetrics.quantity}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="ps-rating-metric">
                                  <span className="ps-rating-label">
                                    Consistency
                                  </span>
                                  <div className="ps-rating-bar">
                                    <div
                                      className="ps-rating-bar-fill"
                                      style={{
                                        width: `${rankingMetrics.consistency}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="ps-chart-block">
                  <div className="ps-chart-header">
                    <h3>Achievement</h3>
                    <div className="action-dropdown__wrapper">
                      <select
                        className="action-dropdown__select"
                        value={actionMode}
                        onChange={(e) => onActionChange(e.target.value)}
                        aria-label="Select action mode"
                      >
                        <option value="total">Total</option>
                        <option value="calls">Calls</option>
                        <option value="emails">Emails</option>
                        <option value="meetings">Meetings</option>
                      </select>
                    </div>
                  </div>
                  <div className="ps-chart-container">
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>
              </div>

              <div className="ps-detailed-column">
                <div className="ps-chain-of-thought-block">
                  <h3>Chain of Thought</h3>
                  <div className="ps-chain-of-thought-content">
                    {chainOfThoughtData.map((entry, index) => (
                      <div key={index} className="ps-chain-of-thought-entry">
                        <div className="ps-chain-of-thought-date">
                          {entry.date}
                        </div>
                        <div className="ps-chain-of-thought-progress">
                          <div className="ps-progress-bar">
                            <div
                              className="ps-progress-bar-fill blue"
                              style={{ width: `${entry.progress.blue}%` }}
                            ></div>
                            <div
                              className="ps-progress-bar-fill green"
                              style={{
                                width: `${entry.progress.green}%`,
                                left: `${entry.progress.blue}%`,
                              }}
                            ></div>
                            <div
                              className="ps-progress-bar-fill gray"
                              style={{
                                width: `${entry.progress.gray}%`,
                                left: `${
                                  entry.progress.blue + entry.progress.green
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="ps-chain-of-thought-performance">
                          {entry.performance}
                          {entry.details && (
                            <button
                              className="ps-details-toggle"
                              onClick={() => toggleEntry(index)}
                              aria-label={
                                expandedEntry === index
                                  ? "Collapse details"
                                  : "Expand details"
                              }
                            >
                              <FontAwesomeIcon
                                icon={
                                  expandedEntry === index
                                    ? faChevronUp
                                    : faChevronDown
                                }
                                className="details-icon"
                              />
                            </button>
                          )}
                        </div>
                        {entry.details && expandedEntry === index && (
                          <div className="ps-details-content-expanded">
                            <div className="ps-details-circle"></div>
                            <div className="ps-details-line"></div>
                            <div className="ps-details-text">
                              {entry.details}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function EmployeeDetail(props) {
  return (
    <Suspense fallback={<SkeletonUI />}>
      <EmployeeDetailContent {...props} />
    </Suspense>
  );
}