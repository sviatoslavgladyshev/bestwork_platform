import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CreateGoal.css";

function getColorForUtilization(utilization) {
  if (utilization >= 1) return "#4fa0ff";
  return "#7b5cdd";
}

function capitalizeWords(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const CreateGoal = ({ onCancel, email, goalTitle, onChange, onNext, evaluationType, onGoalCreated, success }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goalTitle: goalTitle || "",
    startDate: null,
    endDate: null,
    target: "",
    goalAmount: "",
  });
  const [analysisData, setAnalysisData] = useState({
    currentPotential: 0,
    expectedPotential: 0,
    potentialGap: 0,
    potentialGapPercentage: 0,
    estimatedPotential: 0,
    actions: [
      { name: "Calls", iconClass: "fas fa-phone", potential: 0, totalQuantity: 0, weeklyQuantity: 0, conversionRate: 0, dbConversionRate: 0 },
      { name: "Emails", iconClass: "fas fa-envelope", potential: 0, totalQuantity: 0, weeklyQuantity: 0, conversionRate: 0, dbConversionRate: 0 },
      { name: "Meetings", iconClass: "fas fa-calendar-check", potential: 0, totalQuantity: 0, weeklyQuantity: 0, conversionRate: 0, dbConversionRate: 0 },
      { 
        name: evaluationType === "meetings shown" ? "Qualified to Buy" : "Appointments Scheduled", 
        iconClass: evaluationType === "meetings shown" ? "fas fa-eye" : "fas fa-handshake", 
        potential: 0, 
        totalQuantity: 0, 
        weeklyQuantity: 0, 
        conversionRate: 0,
        dbConversionRate: 0 
      },
    ],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === "goalTitle" && onChange) {
      onChange(e);
    }
  };

  const handleDateChange = (date, name) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: date,
    }));
  };

  const calculateActionPotentials = (data, timeframeInWeeks) => {
    const weeklyActions = data.weeklyPotentialActions || {};
    const timeframeActions = data.timeframePotentialActions || {};
    const historicalWeeklyActions = data.historicalWeeklyPotential || {};
    const historicalTimeframeActions = data.historicalTimeframePotential || {};
    const conversionRates = data.conversionRates || {};

    const dbConversionRates = {
      callToMeeting: historicalWeeklyActions.meetings && historicalWeeklyActions.calls 
        ? parseFloat(((historicalWeeklyActions.meetings / historicalWeeklyActions.calls) * 100).toFixed(2)) || 0
        : parseFloat(conversionRates.callToMeeting) || 0,
      emailToMeeting: historicalWeeklyActions.meetings && historicalWeeklyActions.emails 
        ? parseFloat(((historicalWeeklyActions.meetings / historicalWeeklyActions.emails) * 100).toFixed(2)) || 0
        : parseFloat(conversionRates.emailToMeeting) || 0,
      meetingsToQualified: historicalWeeklyActions.qualifiedtobuy && historicalWeeklyActions.meetings 
        ? parseFloat(((historicalWeeklyActions.qualifiedtobuy / historicalWeeklyActions.meetings) * 100).toFixed(2)) || 0
        : parseFloat(conversionRates.meetingsToQualified) || 0,
      appointmentToQualified: historicalWeeklyActions.qualifiedtobuy && historicalWeeklyActions.appointmentscheduled 
        ? parseFloat(((historicalWeeklyActions.qualifiedtobuy / historicalWeeklyActions.appointmentscheduled) * 100).toFixed(2)) || 0
        : parseFloat(conversionRates.appointmentToQualified) || 0,
    };

    const actionMappings = [
      { name: "Calls", key: "calls", conversionKey: "callToMeeting", dbConversionKey: "callToMeeting" },
      { name: "Emails", key: "emails", conversionKey: "emailToMeeting", dbConversionKey: "emailToMeeting" },
      { name: "Meetings", key: "meetings", conversionKey: "meetingsToQualified", dbConversionKey: "meetingsToQualified" },
      { 
        name: evaluationType === "meetings shown" ? "Qualified to Buy" : "Appointments Scheduled", 
        key: evaluationType === "meetings shown" ? "qualifiedtobuy" : "appointmentscheduled", 
        conversionKey: "appointmentToQualified", 
        dbConversionKey: "appointmentToQualified" 
      },
    ];

    const actionDetails = {};
    actionMappings.forEach(({ name, key, conversionKey, dbConversionKey }) => {
      const totalQuantity = parseFloat(timeframeActions[key]) || 0;
      const weeklyQuantity = parseFloat(weeklyActions[key]) || 0;
      const historicalTotalQuantity = parseFloat(historicalTimeframeActions[key]) || 0;
      const historicalWeeklyQuantity = parseFloat(historicalWeeklyActions[key]) || 0;
      const conversionRate = parseFloat(conversionRates[conversionKey]) || 0;
      const dbConversionRate = parseFloat(dbConversionRates[dbConversionKey]) || 0;
      const conversionImprovement = dbConversionRate > 0 
        ? parseFloat(((conversionRate - dbConversionRate) / dbConversionRate * 100).toFixed(2)) || 0
        : conversionRate > 0 ? 100 : 0;

      let potential;
      if (formData.target === "auto") {
        potential = 100;
      } else {
        potential = historicalTotalQuantity > 0 
          ? parseFloat((((totalQuantity - historicalTotalQuantity) / historicalTotalQuantity) * 100 + 100).toFixed(2)) || 0
          : totalQuantity > 0 ? 100 : 0;
      }

      actionDetails[name] = {
        potential,
        totalQuantity,
        weeklyQuantity,
        historicalTotalQuantity,
        historicalWeeklyQuantity,
        conversionRate,
        dbConversionRate,
        conversionImprovement,
      };
    });

    return { actionDetails };
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsAnalyzing(true);
      setError("");

      if (!formData.goalTitle || !formData.startDate || !formData.endDate || !formData.target) {
        setError("Please fill out all required fields.");
        setIsAnalyzing(false);
        return;
      }
      if (formData.target === "manual" && !formData.goalAmount) {
        setError("Please enter a goal amount for manual target.");
        setIsAnalyzing(false);
        return;
      }

      try {
        const timeframeInWeeks = Math.ceil(
          (formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24 * 7)
        );
        if (timeframeInWeeks <= 0) {
          throw new Error("End date must be after start date.");
        }

        const reqBody = {
          email,
          title: formData.goalTitle,
          timeframeInWeeks,
          ...(formData.target === "manual" && { quantity: parseFloat(formData.goalAmount) }),
          ...(formData.target === "auto" && { optimized: true }),
          analyzeOnly: true,
        };

        console.log("Step 2 - API Request Body:", reqBody);

        const response = await fetch(
          "https://h0qcatredi.execute-api.us-east-1.amazonaws.com/dev/analyze-goal",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqBody),
          }
        );

        const data = await response.json();
        console.log("Step 2 - API Response:", data);

        if (!response.ok) {
          throw new Error(data.error || "Error analyzing goal");
        }

        const estimatedPotential = parseFloat(data.potentialQuantity || 0);
        const currentPotential = formData.target === "manual" 
          ? parseFloat(data.timeframePotentialActions[evaluationType === "meetings shown" ? "qualifiedtobuy" : "appointmentscheduled"] || 0)
          : estimatedPotential;
        const expectedPotential = formData.target === "manual" 
          ? parseFloat(data.historicalTimeframePotential[evaluationType === "meetings shown" ? "qualifiedtobuy" : "appointmentscheduled"] || 0)
          : estimatedPotential;
        const potentialGap = expectedPotential - currentPotential;
        const potentialGapPercentage = currentPotential !== 0 
          ? ((expectedPotential - currentPotential) / currentPotential) * 100 
          : 0;

        console.log("Step 2 - Calculated Values:", { 
          currentPotential,
          expectedPotential,
          potentialGap,
          potentialGapPercentage,
          formDataTarget: formData.target,
          evaluationType,
        });

        const { actionDetails } = calculateActionPotentials(data, timeframeInWeeks);

        setAnalysisData({
          currentPotential,
          expectedPotential,
          potentialGap,
          potentialGapPercentage,
          estimatedPotential,
          actions: analysisData.actions.map((action) => ({
            ...action,
            potential: actionDetails[action.name]?.potential || 0,
            totalQuantity: actionDetails[action.name]?.totalQuantity || 0,
            weeklyQuantity: actionDetails[action.name]?.weeklyQuantity || 0,
            conversionRate: actionDetails[action.name]?.conversionRate || 0,
            dbConversionRate: actionDetails[action.name]?.dbConversionRate || 0,
            conversionImprovement: actionDetails[action.name]?.conversionImprovement || 0,
            details: {
              conversionRate: actionDetails[action.name]?.conversionRate || 0,
              dbConversionRate: actionDetails[action.name]?.dbConversionRate || 0,
              conversionImprovement: actionDetails[action.name]?.conversionImprovement || 0,
              weeklyQuantity: actionDetails[action.name]?.weeklyQuantity || 0,
              totalQuantity: actionDetails[action.name]?.totalQuantity || 0,
            },
          })),
        });

        setStep(3);
      } catch (err) {
        setError(err.message);
        console.error("Step 2 - Error:", err);
      } finally {
        setIsAnalyzing(false);
      }
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setIsSubmitting(true);
      setError("");

      try {
        const timeframeInWeeks = Math.ceil(
          (formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24 * 7)
        );
        if (timeframeInWeeks <= 0) {
          throw new Error("End date must be after start date.");
        }

        const reqBody = {
          email,
          title: formData.goalTitle,
          timeframeInWeeks,
          ...(formData.target === "manual" && { quantity: parseFloat(formData.goalAmount) }),
          ...(formData.target === "auto" && { optimized: true }),
          analyzeOnly: false,
        };

        console.log("Step 4 - API Request Body:", reqBody);

        const response = await fetch(
          "https://h0qcatredi.execute-api.us-east-1.amazonaws.com/dev/analyze-goal",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqBody),
          }
        );

        const data = await response.json();
        console.log("Step 4 - API Response:", data);

        if (!response.ok) {
          throw new Error(data.error || "Error saving goal");
        }

        const newGoal = {
          title: formData.goalTitle,
          timeframeInWeeks,
          quantity: data.potentialQuantity,
          evaluationType: data.evaluationType,
          weeklyPotentialActions: data.weeklyPotentialActions,
          timeframePotentialActions: data.timeframePotentialActions,
          goalMode: formData.target === "auto" ? "auto" : "manual",
          conversionRates: data.conversionRates,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "Active",
        };

        console.log("Step 4 - New Goal Created:", newGoal);

        if (onGoalCreated) {
          onGoalCreated(newGoal); // This will set goalSuccess to true in Dashboard
        }

        console.log("Success state set to true, expecting overlay");
      } catch (err) {
        setError(err.message);
        console.error("Step 4 - Error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    }
    setError("");
  };

  useEffect(() => {
    console.log("Analysis Data Updated:", analysisData);
  }, [analysisData]);

  const hasNegativeValues = formData.target === "manual" && (
    analysisData.currentPotential < 0 || 
    analysisData.potentialGap < 0 || 
    analysisData.expectedPotential < 0
  ) || (formData.target === "auto" && analysisData.estimatedPotential < 0);

  const maxValue = hasNegativeValues 
    ? Math.max(
        Math.abs(analysisData.currentPotential), 
        Math.abs(analysisData.expectedPotential), 
        Math.abs(analysisData.potentialGap), 
        formData.target === "auto" ? Math.abs(analysisData.estimatedPotential) : 0,
        1
      ) * 1.1
    : Math.max(
        formData.target === "manual" 
          ? Math.max(analysisData.currentPotential, analysisData.expectedPotential, analysisData.potentialGap, 1)
          : analysisData.estimatedPotential,
        1
      ) * 1.1;

  const handleCardClick = (action) => {
    setSelectedAction(selectedAction?.name === action.name ? null : action);
  };

  const evalTypeLabel = evaluationType ? capitalizeWords(evaluationType) : "Meetings";

  return (
    <div className="cg-overlay">
      {(step === 1 || step === 2) && (
        <div className={`cg-content step-${step}`}>
          {step === 1 && (
            <>
              <h1>Let's create a new goal</h1>
              <p>What would you like to name it?</p>
              <div className="cg-input-container">
                <input
                  type="text"
                  placeholder="Goal title"
                  name="goalTitle"
                  value={formData.goalTitle}
                  onChange={handleChange}
                  className="cg-input"
                />
              </div>
              <div className="cg-buttons">
                <button className="cg-back" onClick={onCancel}>
                  Cancel
                </button>
                <button className="cg-next" onClick={handleNext}>
                  Next →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Please enter the details</h1>
              <div className="cg-input-container">
                <label>Start date</label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, "startDate")}
                  placeholderText="MM/DD/YYYY"
                  className="cg-date-picker-input cg-start-date-picker"
                  dateFormat="MM/dd/yyyy"
                />
              </div>
              <div className="cg-input-container">
                <label>End date</label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => handleDateChange(date, "endDate")}
                  placeholderText="MM/DD/YYYY"
                  className="cg-date-picker-input cg-end-date-picker"
                  dateFormat="MM/dd/yyyy"
                />
              </div>
              <div className="cg-target-container">
                <div className="cg-target-row">
                  <div className="cg-target-select-wrapper">
                    <label>Target</label>
                    <select
                      name="target"
                      value={formData.target}
                      onChange={handleChange}
                      className="cg-select-input"
                    >
                      <option value="">Select</option>
                      <option value="auto">Auto</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  {formData.target === "manual" && (
                    <div className="cg-goal-amount-wrapper">
                      <label>Goal amount</label>
                      <input
                        type="number"
                        name="goalAmount"
                        value={formData.goalAmount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        className="cg-goal-amount-input"
                      />
                    </div>
                  )}
                </div>
              </div>
              {error && <p className="cg-error">{error}</p>}
              <div className="cg-buttons">
                <button className="cg-back" onClick={handleBack}>
                  Previous
                </button>
                <button
                  className="cg-next"
                  onClick={handleNext}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="cg-analysis-container">
          <div className="cg-columns">
            <div className="cg-bar-chart-column">
              <div className="cg-bar-chart-wrapper">
                <div className="cg-y-axis-container">
                  <div className="cg-y-label">{evalTypeLabel}</div>
                  <div className="cg-y-axis">
                    {hasNegativeValues ? (
                      <>
                        <span>{Math.round(maxValue)}</span>
                        <span>{Math.round(maxValue * 0.5)}</span>
                        <span>0</span>
                        <span>{Math.round(-maxValue * 0.5)}</span>
                        <span>{Math.round(-maxValue)}</span>
                      </>
                    ) : (
                      <>
                        <span>{Math.round(maxValue)}</span>
                        <span>{Math.round(maxValue * 0.75)}</span>
                        <span>{Math.round(maxValue * 0.5)}</span>
                        <span>{Math.round(maxValue * 0.25)}</span>
                        <span>0</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="cg-bar-chart" data-has-negative={hasNegativeValues}>
                  {formData.target === "manual" ? (
                    <>
                      <div className="cg-bar">
                        <div className="cg-bar-value">{Math.round(analysisData.currentPotential)}</div>
                        <div
                          className="cg-bar-fill cg-current-potential"
                          style={{
                            height: `${(Math.abs(analysisData.currentPotential) / maxValue) * (hasNegativeValues ? 50 : 100)}%`,
                            bottom: hasNegativeValues ? (analysisData.currentPotential >= 0 ? "50%" : "auto") : "0",
                            top: hasNegativeValues ? (analysisData.currentPotential < 0 ? "50%" : "auto") : "auto",
                          }}
                        ></div>
                        <div className="cg-label-with-tooltip">
                          <p>Current Potential</p>
                          <i className="fas fa-info-circle cg-info-icon"></i>
                          <span className="cg-tooltip">
                            Your current performance potential based on current actions.
                          </span>
                        </div>
                      </div>
                      <div className="cg-bar">
                        <div className="cg-bar-value">{Math.round(analysisData.potentialGapPercentage)}%</div>
                        <div
                          className={`cg-bar-fill cg-potential-gap ${analysisData.potentialGap < 0 ? "cg-negative" : ""}`}
                          style={{
                            height: `${(Math.abs(analysisData.potentialGap) / maxValue) * (hasNegativeValues ? 50 : 100)}%`,
                            bottom: hasNegativeValues ? (analysisData.potentialGap >= 0 ? "50%" : "auto") : "0",
                            top: hasNegativeValues ? (analysisData.potentialGap < 0 ? "50%" : "auto") : "auto",
                          }}
                        ></div>
                        <div className="cg-label-with-tooltip">
                          <p>Potential Gap</p>
                          <i className="fas fa-info-circle cg-info-icon"></i>
                          <span className="cg-tooltip">
                            The difference between expected and current potential.
                          </span>
                        </div>
                      </div>
                      <div className="cg-bar">
                        <div className="cg-bar-value">{Math.round(analysisData.expectedPotential)}</div>
                        <div
                          className="cg-bar-fill cg-expected-potential"
                          style={{
                            height: `${(Math.abs(analysisData.expectedPotential) / maxValue) * (hasNegativeValues ? 50 : 100)}%`,
                            bottom: hasNegativeValues ? (analysisData.expectedPotential >= 0 ? "50%" : "auto") : "0",
                            top: hasNegativeValues ? (analysisData.expectedPotential < 0 ? "50%" : "auto") : "auto",
                          }}
                        ></div>
                        <div className="cg-label-with-tooltip">
                          <p>Expected Potential</p>
                          <i className="fas fa-info-circle cg-info-icon"></i>
                          <span className="cg-tooltip">
                            The potential you could achieve based on historical performance.
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="cg-bar">
                      <div className="cg-bar-value">{Math.round(analysisData.estimatedPotential)}</div>
                      <div
                        className="cg-bar-fill cg-estimated-potential"
                        style={{
                          height: `${(Math.abs(analysisData.estimatedPotential) / maxValue) * (hasNegativeValues ? 50 : 100)}%`,
                          bottom: hasNegativeValues ? (analysisData.estimatedPotential >= 0 ? "50%" : "auto") : "0",
                          top: hasNegativeValues ? (analysisData.estimatedPotential < 0 ? "50%" : "auto") : "auto",
                        }}
                      ></div>
                      <div className="cg-label-with-tooltip">
                        <p>Estimated Potential</p>
                        <i className="fas fa-info-circle cg-info-icon"></i>
                        <span className="cg-tooltip">
                          The maximum achievable value based on optimized actions.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="cg-cards-column">
              <div className="cg-cards-header">
                <span>Action</span>
                <span>Potential</span>
              </div>
              <div className="cg-cards-content">
                {analysisData.actions.map((action, index) => (
                  <div
                    key={index}
                    className={`cg-card ${selectedAction?.name === action.name ? "cg-card-selected" : ""}`}
                    onClick={() => handleCardClick(action)}
                  >
                    <div className="cg-card-main">
                      <i className={`${action.iconClass} cg-card-icon`}></i>
                      <div className="cg-card-action">{capitalizeWords(action.name)}</div>
                      <div className="cg-card-progress">
                        <div
                          className="cg-progress-fill"
                          style={{
                            width: `${action.potential}%`,
                            backgroundColor: getColorForUtilization(action.potential / 100),
                          }}
                        ></div>
                      </div>
                      <div className="cg-card-percentage">{Math.ceil(action.potential)}%</div>
                    </div>
                    {selectedAction?.name === action.name && (
                      <div className="cg-card-details">
                        <div className="cg-detail-row">
                          <span>Current Conversion</span>
                          <span>{action.details.dbConversionRate.toFixed(1)}%</span>
                        </div>
                        <div className="cg-detail-row">
                          <span>Expected Conversion</span>
                          <span>{action.details.conversionRate.toFixed(1)}%</span>
                        </div>
                        <div className="cg-detail-row">
                          <span>Conversion Improvement</span>
                          <span>{action.details.conversionImprovement.toFixed(1)}%</span>
                        </div>
                        <div className="cg-detail-row">
                          <span>Weekly Target</span>
                          <span>{Math.round(action.details.weeklyQuantity)}</span>
                        </div>
                        <div className="cg-detail-row">
                          <span>Total Target</span>
                          <span>{Math.round(action.totalQuantity)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="cg-buttons-container">
            <button className="cg-back" onClick={handleBack}>
              Previous
            </button>
            <button
              className="cg-next"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {error && <p className="cg-error">{error}</p>}
        </div>
      )}

      {step === 4 && (
        <div className="cg-confirmation-overlay">
          <div className="cg-confirmation-content">
            <h1>Submit goal?</h1>
            <div className="cg-confirmation-buttons">
              <button className="cg-back" onClick={handleBack}>
                Previous
              </button>
              <button
                className="cg-submit-confirm"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"} →
              </button>
            </div>
            {error && <p className="cg-error">{error}</p>}
          </div>
        </div>
      )}

      {success && (
        <div className="cg-success-overlay">
          <div className="cg-success-content">
            <h1>
              Your goal <span className="cg-goal-title">"{formData.goalTitle}"</span> is successfully created!
            </h1>
            <p className="cg-success-subtitle">Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGoal;