import React, { Suspense, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faInfoCircle,
  faEllipsisH,
  faPhone,
  faEnvelope,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import "./EmployeeCards.css";

// Returns a generic icon for employees
function getEmployeeIcon() {
  return faUser;
}

// Generates a consistent color based on the employee name
function generateColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return {
    wrapperBgColor: `hsl(${hue}, 70%, 80%)`,
    iconFgColor: `hsl(${hue}, 70%, 50%)`,
  };
}

// Skeleton UI Component
const SkeletonUI = () => (
  <div className="taq-effort-content">
    <div className="detailed-subtable">
      {Array(5)
        .fill()
        .map((_, idx) => (
          <div key={idx} className="ps-skeleton ps-skeleton-card" />
        ))}
    </div>
  </div>
);

// Calculate completion rate based on actionMode
const calculateCompletionRate = (metrics, actionMode) => {
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

// Main Component Content
const EmployeeCardsContent = memo(function EmployeeCardsContent({
  employees = [],
  timeframeMode = "total",
  actionMode = "total",
  onTimeframeChange = () => {},
  onActionChange = () => {},
  onEmployeeSelect = () => {},
}) {
  return (
    <div className="detailed-subtable">
      <div className="summary-header">
        <div className="header-action">Employees</div>
        <div className="header-achievement">
          <span className="header-text">Achievement</span>
          <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
          <span className="tooltip-text">
            {actionMode === "total"
              ? "The number of calls, emails, and meetings completed compared to the target."
              : `The number of ${actionMode} completed compared to the target.`}
          </span>
        </div>
        <div className="header-conversion">
          <span className="header-text">Completion Rate</span>
          <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
          <span className="tooltip-text">
            {actionMode === "total"
              ? "The average percentage of target calls, emails, and meetings completed."
              : `The percentage of target ${actionMode} completed.`}
          </span>
        </div>
      </div>
      {employees.length === 0 ? (
        <div className="no-data">No employees available</div>
      ) : (
        employees.map((employee, idx) => {
          const { firstName, lastName, activityMetrics } = employee;
          const name = `${firstName} ${lastName}`.trim() || employee.email;
          const metrics = activityMetrics?.[timeframeMode]?.counts || {
            calls: { logged: 0, target: 0 },
            emails: { logged: 0, target: 0 },
            meetings: { logged: 0, target: 0 },
          };

          const completionRate = calculateCompletionRate(metrics, actionMode);
          const { wrapperBgColor, iconFgColor } = generateColorFromName(name);

          return (
            <div
              key={idx}
              className="summary-card"
              style={{
                backgroundColor:
                  name === "Jack Schultz" ? "rgba(255, 0, 0, 0.1)" : "inherit",
              }}
              onClick={() => onEmployeeSelect(name)}
              role="button"
              tabIndex={0}
              aria-label={`Select employee ${name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onEmployeeSelect(name);
                }
              }}
            >
              <div className="card-icon">
                <div
                  className="icon-wrapper"
                  style={{ "--wrapper-bg-color": wrapperBgColor }}
                >
                  <FontAwesomeIcon
                    icon={getEmployeeIcon()}
                    className="action-icon"
                    style={{ color: iconFgColor }}
                  />
                </div>
              </div>
              <div className="card-action">{name}</div>
              <div className="card-achievement">
                <div className="achievement-icons">
                  {actionMode === "total" ? (
                    <>
                      <div className="achievement-item" title="Calls">
                        <FontAwesomeIcon icon={faPhone} className="achievement-icon phone" />
                        {metrics.calls?.logged ?? 0}/{Math.round(metrics.calls?.target ?? 0)}
                      </div>
                      <div className="achievement-item" title="Emails">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="achievement-icon envelope"
                        />
                        {metrics.emails?.logged ?? 0}/{Math.round(metrics.emails?.target ?? 0)}
                      </div>
                      <div className="achievement-item" title="Meetings">
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="achievement-icon calendar"
                        />
                        {metrics.meetings?.logged ?? 0}/{Math.round(metrics.meetings?.target ?? 0)}
                      </div>
                    </>
                  ) : (
                    <div className="achievement-item" title={actionMode}>
                      <FontAwesomeIcon
                        icon={{
                          calls: faPhone,
                          emails: faEnvelope,
                          meetings: faCalendar,
                        }[actionMode] || faUser}
                        className={`achievement-icon ${
                          { calls: "phone", emails: "envelope", meetings: "calendar" }[actionMode] ||
                          ""
                        }`}
                      />
                      {metrics[actionMode]?.logged ?? 0}/
                      {Math.round(metrics[actionMode]?.target ?? 0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="card-conversion">
                <div className="ps-progress-bar">
                  <div
                    className="ps-progress-bar-fill"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <span className="progress-percentage">{completionRate}%</span>
              </div>
              <div className="card-ellipsis">
                <FontAwesomeIcon icon={faEllipsisH} className="ellipsis-icon" />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
});

// Export with Suspense
export default function EmployeeCards(props) {
  return (
    <Suspense fallback={<SkeletonUI />}>
      <EmployeeCardsContent {...props} />
    </Suspense>
  );
}