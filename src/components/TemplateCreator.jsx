import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import './TemplateCreator.css';

// Placeholder icons (replace with actual assets)
import goalIconBlue from '/assets/client_communications_type_icon_scenario.png';
import goalIconGrey from '/assets/client_communications_type_icon_scenario.png';
import typeIconBlue from '/assets/project_status_update_type_icon_scenario.png';
import typeIconGrey from '/assets/project_status_update_type_icon_scenario.png';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error: error.message };
  }

  render() {
    if (this.state.error) {
      return <div style={{ color: 'red', padding: '20px' }}>Error: {this.state.error}</div>;
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const TemplateCreator = ({
  userEmail,
  handleBack,
  templateName,
  onTemplateNameChange,
  templateData,
  setTemplateData,
  isPublishing,
  setIsPublishing,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(templateData?.goal || null);
  const [selectedType, setSelectedType] = useState(templateData?.type || null);
  const [breakfastTime, setBreakfastTime] = useState(templateData?.breakfastTime || '');
  const [lunchTime, setLunchTime] = useState(templateData?.lunchTime || '');
  const [dinnerTime, setDinnerTime] = useState(templateData?.dinnerTime || '');
  const [sleepTime, setSleepTime] = useState(templateData?.sleepTime || '');
  const [hasRecurringEvents, setHasRecurringEvents] = useState(templateData?.hasRecurringEvents || null);
  const [recurringEvents, setRecurringEvents] = useState(templateData?.recurringEvents || []);
  const [workflowTitle, setWorkflowTitle] = useState(templateName || '');
  const [error, setError] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [direction, setDirection] = useState('next');

  const scrollableRef = useRef(null);
  const cardRefs = useRef([]);

  const goals = [
    { id: 'start_business', name: 'Start a Business', description: 'Launch your own company or venture.' },
    { id: 'get_internship', name: 'Get an Internship', description: 'Secure a professional internship opportunity.' },
  ];

  const businessTypes = [
    { id: 'tech_startup', name: 'Tech Startup', description: 'A technology-driven company with innovative solutions.' },
    { id: 'online_service', name: 'Online Service', description: 'A digital service offered over the internet.' },
    { id: 'in_person_service', name: 'In-Person Service', description: 'Services provided face-to-face with clients.' },
    { id: 'e_commerce_website', name: 'E-commerce Website', description: 'An online store selling products or services.' },
  ];

  const internshipTypes = [
    { id: 'finance', name: 'Finance', description: 'Internships in banking, investment, or financial analysis.' },
    { id: 'software_engineering', name: 'Software Engineering', description: 'Internships in coding, development, or tech.' },
    { id: 'sales', name: 'Sales', description: 'Internships in business development or customer acquisition.' },
    { id: 'marketing', name: 'Marketing', description: 'Internships in advertising, branding, or digital marketing.' },
  ];

  const breakfastTimeOptions = Array.from({ length: 7 }, (_, i) => {
    const hour = (i + 5) % 12 === 0 ? 12 : (i + 5) % 12;
    return `${hour}:00 AM`;
  });

  const lunchTimeOptions = Array.from({ length: 5 }, (_, i) => {
    const hour = (i + 11) % 12 === 0 ? 12 : (i + 11) % 12;
    const period = i + 11 < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${period}`;
  });

  const dinnerTimeOptions = Array.from({ length: 6 }, (_, i) => {
    const hour = (i + 5) % 12 === 0 ? 12 : (i + 5) % 12;
    return `${hour}:00 PM`;
  });

  const sleepTimeOptions = [
    ...Array.from({ length: 8 }, (_, i) => {
      const hour = (i + 8) % 12 === 0 ? 12 : (i + 8) % 12;
      return `${hour}:00 PM`;
    }),
    ...Array.from({ length: 4 }, (_, i) => {
      const hour = i + 12 === 12 ? 12 : i;
      return `${hour}:00 AM`;
    }),
  ];

  const eventTimeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const period = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${period}`;
  });

  const eventTypes = ['Meeting', 'Exercise', 'Study Session', 'Other'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled) {
        setHasScrolled(true);
      }
    };

    const scrollableElement = scrollableRef.current;
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasScrolled]);

  useEffect(() => {
    // Reset refs to avoid stale references
    cardRefs.current = [];

    const handleMouseMove = (e, card) => {
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const maxTilt = 10; // Maximum tilt angle in degrees
      const tiltX = (y / rect.height) * maxTilt;
      const tiltY = -(x / rect.width) * maxTilt;

      // Preserve existing transforms (e.g., hover, selected)
      const isSelected = card.classList.contains('selected');
      const baseTransform = isSelected ? 'scale(1.02)' : '';
      card.style.transform = `${baseTransform} perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    };

    const handleMouseLeave = (card) => {
      if (card) {
        const isSelected = card.classList.contains('selected');
        card.style.transform = isSelected
          ? 'scale(1.02) perspective(1000px) rotateX(0deg) rotateY(0deg)'
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      }
    };

    cardRefs.current.forEach((card) => {
      if (card) {
        card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
        card.addEventListener('mouseleave', () => handleMouseLeave(card));
      }
    });

    return () => {
      cardRefs.current.forEach((card) => {
        if (card) {
          card.removeEventListener('mousemove', (e) => handleMouseMove(e, card));
          card.removeEventListener('mouseleave', () => handleMouseLeave(card));
        }
      });
    };
  }, [currentStep, goals, businessTypes, internshipTypes]);

  const handleGoalSelect = useCallback((goalId) => {
    setSelectedGoal(goalId);
    setSelectedType(null);
    setTemplateData((prev) => ({ ...prev, goal: goalId, type: null }));
  }, [setTemplateData]);

  const handleTypeSelect = useCallback((typeId) => {
    setSelectedType(typeId);
    setTemplateData((prev) => ({ ...prev, type: typeId }));
  }, [setTemplateData]);

  const handleTimeChange = useCallback((field, value) => {
    if (field === 'breakfast') {
      setBreakfastTime(value);
      setTemplateData((prev) => ({ ...prev, breakfastTime: value }));
    } else if (field === 'lunch') {
      setLunchTime(value);
      setTemplateData((prev) => ({ ...prev, lunchTime: value }));
    } else if (field === 'dinner') {
      setDinnerTime(value);
      setTemplateData((prev) => ({ ...prev, dinnerTime: value }));
    } else if (field === 'sleep') {
      setSleepTime(value);
      setTemplateData((prev) => ({ ...prev, sleepTime: value }));
    }
  }, [setTemplateData]);

  const handleRecurringEventsSelect = useCallback((value) => {
    setHasRecurringEvents(value);
    const newEvents = value === 'yes' ? [{ eventType: '', startTime: '', endTime: '', days: [] }] : [];
    setRecurringEvents(newEvents);
    setTemplateData((prev) => ({
      ...prev,
      hasRecurringEvents: value,
      recurringEvents: newEvents,
    }));
  }, [setTemplateData]);

  const handleAddEvent = useCallback(() => {
    setRecurringEvents((prev) => [
      ...prev,
      { eventType: '', startTime: '', endTime: '', days: [] },
    ]);
    setTemplateData((prev) => ({
      ...prev,
      recurringEvents: [
        ...(prev.recurringEvents || []),
        { eventType: '', startTime: '', endTime: '', days: [] },
      ],
    }));
  }, [setTemplateData]);

  const handleEventChange = useCallback((index, field, value) => {
    setRecurringEvents((prev) => {
      const updatedEvents = [...prev];
      updatedEvents[index] = { ...updatedEvents[index], [field]: value };
      return updatedEvents;
    });
    setTemplateData((prev) => ({
      ...prev,
      recurringEvents: prev.recurringEvents.map((event, i) =>
        i === index ? { ...event, [field]: value } : event
      ),
    }));
  }, [setTemplateData]);

  const handleWorkflowTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setWorkflowTitle(newTitle);
    onTemplateNameChange({ target: { value: newTitle } });
    setTemplateData((prev) => ({ ...prev, workflowTitle: newTitle }));
  }, [onTemplateNameChange, setTemplateData]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    setError(null);

    const payload = {
      userEmail,
      templateName: workflowTitle,
      goal: selectedGoal,
      type: selectedType,
      breakfastTime,
      lunchTime,
      dinnerTime,
      sleepTime,
      hasRecurringEvents,
      recurringEvents,
      workflowTitle,
    };

    try {
      const response = await fetch(
        'https://2ofjdl14kg.execute-api.us-east-1.amazonaws.com/prod/publish',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => {});
        throw new Error(
          errorData?.error || `Failed to publish template (Status: ${response.status})`
        );
      }

      setCurrentStep(1);
      setSelectedGoal(null);
      setSelectedType(null);
      setBreakfastTime('');
      setLunchTime('');
      setDinnerTime('');
      setSleepTime('');
      setHasRecurringEvents(null);
      setRecurringEvents([]);
      setWorkflowTitle('');
      setHasScrolled(false);
      setTemplateData({});
      localStorage.removeItem('templateData');
      handleBack();
    } catch (err) {
      setError(err.message || 'Failed to publish template. Please try again or contact support.');
    } finally {
      setIsPublishing(false);
    }
  }, [
    userEmail,
    workflowTitle,
    selectedGoal,
    selectedType,
    breakfastTime,
    lunchTime,
    dinnerTime,
    sleepTime,
    hasRecurringEvents,
    recurringEvents,
    handleBack,
    setTemplateData,
    setIsPublishing,
  ]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && selectedGoal) {
      setDirection('next');
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedType) {
      setDirection('next');
      setCurrentStep(3);
    } else if (currentStep === 3 && breakfastTime) {
      setDirection('next');
      setCurrentStep(4);
    } else if (currentStep === 4 && lunchTime) {
      setDirection('next');
      setCurrentStep(5);
    } else if (currentStep === 5 && dinnerTime) {
      setDirection('next');
      setCurrentStep(6);
    } else if (currentStep === 6 && sleepTime) {
      setDirection('next');
      setCurrentStep(7);
    } else if (
      currentStep === 7 &&
      hasRecurringEvents &&
      (hasRecurringEvents === 'no' ||
        (hasRecurringEvents === 'yes' &&
          recurringEvents.every(
            (event) => event.eventType && event.startTime && event.endTime && event.days.length > 0
          )))
    ) {
      setDirection('next');
      setCurrentStep(8);
    } else {
      setError('Please complete the required fields to proceed.');
    }
  }, [
    currentStep,
    selectedGoal,
    selectedType,
    breakfastTime,
    lunchTime,
    dinnerTime,
    sleepTime,
    hasRecurringEvents,
    recurringEvents,
  ]);

  const handleBackStep = useCallback(() => {
    if (currentStep > 1) {
      setDirection('back');
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  }, [currentStep]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Select Goal';
      case 2:
        return selectedGoal === 'start_business' ? 'Select Business Type' : 'Select Internship Type';
      case 3:
        return 'Breakfast Time';
      case 4:
        return 'Lunch Time';
      case 5:
        return 'Dinner Time';
      case 6:
        return 'Sleep Time';
      case 7:
        return 'Recurring Events';
      case 8:
        return 'Review Your Selections';
      default:
        return '';
    }
  };

  const stepVariants = {
    initial: (dir) => ({
      opacity: 0,
      x: dir === 'next' ? 50 : -50,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir === 'next' ? -50 : 50,
      transition: { duration: 0.3, ease: 'easeIn' },
    }),
  };

  return (
    <ErrorBoundary>
      <div className="template-creator-selector-container">
        <div className="template-creator-left-aligned-container">
          <div className="template-creator-header">
            <span className="template-creator-header-title">
              {getStepTitle()}
              <span className="template-creator-header-dot"> • </span>
              Step {currentStep} of 8
            </span>
          </div>
          <div className="template-creator-progress-bar">
            <div className="template-creator-progress-segments">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className={`template-creator-progress ${index + 1 <= currentStep ? 'success' : ''}`}
                  data-step={index + 1}
                />
              ))}
            </div>
          </div>
          {currentStep === 1 && (
            <h3 className="template-creator-step-title">What do you want to accomplish?</h3>
          )}
          {currentStep === 2 && (
            <h3 className="template-creator-step-title">
              {selectedGoal === 'start_business'
                ? 'Select which type of business you want to create'
                : 'Select which type of internship you want to get'}
            </h3>
          )}
          {currentStep === 3 && (
            <h3 className="template-creator-step-title">When do you normally eat breakfast?</h3>
          )}
          {currentStep === 4 && (
            <h3 className="template-creator-step-title">When do you normally eat lunch?</h3>
          )}
          {currentStep === 5 && (
            <h3 className="template-creator-step-title">When do you normally eat dinner?</h3>
          )}
          {currentStep === 6 && (
            <h3 className="template-creator-step-title">When do you normally go to sleep?</h3>
          )}
          {currentStep === 7 && (
            <h3 className="template-creator-step-title">Are there any other recurring events in your life?</h3>
          )}
          {currentStep === 8 && (
            <h3 className="template-creator-step-title">Review Your Selections</h3>
          )}
        </div>

        <div className={`template-creator-scrollable-content step-${currentStep}`} ref={scrollableRef}>
          <div className="template-creator-centered-content">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="template-creator-step-content"
              >
                {error && (
                  <div
                    className="template-creator-error"
                    style={{ color: 'red', marginBottom: '20px' }}
                  >
                    {error}
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="template-creator-grid">
                    {goals.map((goal, index) => (
                      <div
                        key={goal.id}
                        className={`template-creator-card ${selectedGoal === goal.id ? 'selected' : ''}`}
                        onClick={() => handleGoalSelect(goal.id)}
                        ref={(el) => (cardRefs.current[index] = el)}
                      >
                        <div className="template-creator-card-content">
                          <img
                            src={selectedGoal === goal.id ? goalIconBlue : goalIconGrey}
                            alt={`${goal.name} icon`}
                            className="template-creator-icon"
                          />
                          <div className="template-creator-email-type">{goal.name}</div>
                          <div className="template-creator-description">{goal.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="template-creator-grid">
                    {(selectedGoal === 'start_business' ? businessTypes : internshipTypes).map((type, index) => (
                      <div
                        key={type.id}
                        className={`template-creator-card ${selectedType === type.id ? 'selected' : ''}`}
                        onClick={() => handleTypeSelect(type.id)}
                        ref={(el) => (cardRefs.current[index] = el)}
                      >
                        <div className="template-creator-card-content">
                          <img
                            src={selectedType === type.id ? typeIconBlue : typeIconGrey}
                            alt={`${type.name} icon`}
                            className="template-creator-icon"
                          />
                          <div className="template-creator-email-type">{type.name}</div>
                          <div className="template-creator-description">{type.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="template-creator-dropdown-wrapper">
                    <select
                      className="template-creator-dropdown"
                      value={breakfastTime}
                      onChange={(e) => handleTimeChange('breakfast', e.target.value)}
                    >
                      <option value="">Select time</option>
                      {breakfastTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="template-creator-dropdown-wrapper">
                    <select
                      className="template-creator-dropdown"
                      value={lunchTime}
                      onChange={(e) => handleTimeChange('lunch', e.target.value)}
                    >
                      <option value="">Select time</option>
                      {lunchTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="template-creator-dropdown-wrapper">
                    <select
                      className="template-creator-dropdown"
                      value={dinnerTime}
                      onChange={(e) => handleTimeChange('dinner', e.target.value)}
                    >
                      <option value="">Select time</option>
                      {dinnerTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="template-creator-dropdown-wrapper">
                    <select
                      className="template-creator-dropdown"
                      value={sleepTime}
                      onChange={(e) => handleTimeChange('sleep', e.target.value)}
                    >
                      <option value="">Select time</option>
                      {sleepTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="template-creator-selected-scenarios-section">
                    <div className="template-creator-choice-row">
                      {['yes', 'no'].map((option, index) => (
                        <div
                          key={option}
                          className={`template-creator-card ${hasRecurringEvents === option ? 'selected' : ''}`}
                          onClick={() => handleRecurringEventsSelect(option)}
                          ref={(el) => (cardRefs.current[index] = el)}
                        >
                          <div className="template-creator-card-content">
                            <div className="template-creator-email-type">{option.charAt(0).toUpperCase() + option.slice(1)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {hasRecurringEvents === 'yes' && (
                      <div className="template-creator-context-section">
                        <h4 className="template-creator-context-title">Add Recurring Events</h4>
                        {recurringEvents.map((event, index) => (
                          <div key={index} className="template-creator-event-form">
                            <div className="template-creator-dropdown-wrapper">
                              <select
                                className="template-creator-dropdown"
                                value={event.eventType}
                                onChange={(e) => handleEventChange(index, 'eventType', e.target.value)}
                              >
                                <option value="">Select event type</option>
                                {eventTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="template-creator-time-wrapper">
                              <div className="template-creator-dropdown-wrapper">
                                <select
                                  className="template-creator-dropdown"
                                  value={event.startTime}
                                  onChange={(e) => handleEventChange(index, 'startTime', e.target.value)}
                                >
                                  <option value="">Select start time</option>
                                  {eventTimeOptions.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="template-creator-time-divider">to</div>
                              <div className="template-creator-dropdown-wrapper">
                                <select
                                  className="template-creator-dropdown"
                                  value={event.endTime}
                                  onChange={(e) => handleEventChange(index, 'endTime', e.target.value)}
                                >
                                  <option value="">Select end time</option>
                                  {eventTimeOptions.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="template-creator-days-selection">
                              <h4 className="template-creator-context-title">Days Repeated</h4>
                              <div className="template-creator-days-grid">
                                {daysOfWeek.map((day) => (
                                  <label key={day} className="template-creator-day-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={event.days.includes(day)}
                                      onChange={(e) => {
                                        const updatedDays = e.target.checked
                                          ? [...event.days, day]
                                          : event.days.filter((d) => d !== day);
                                        handleEventChange(index, 'days', updatedDays);
                                      }}
                                    />
                                    <span>{day.slice(0, 3)}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            {index < recurringEvents.length - 1 && (
                              <div className="template-creator-section-divider" />
                            )}
                          </div>
                        ))}
                        <button
                          className="template-creator-upload-more-btn"
                          onClick={handleAddEvent}
                        >
                          Add New Event
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 8 && (
                  <div className="template-creator-review-section template-creator-left-aligned-review">
                    <div>
                      <h3 className="template-creator-review-title">Title</h3>
                      <div className="template-creator-input-wrapper">
                        <input
                          type="text"
                          className="template-creator-title-input"
                          placeholder="Enter workflow title"
                          value={workflowTitle}
                          onChange={handleWorkflowTitleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">Goal</h3>
                      <div className="template-creator-grid">
                        <div className="template-creator-card selected">
                          <img
                            src={goalIconBlue}
                            alt="Goal icon"
                            className="template-creator-icon"
                          />
                          <div className="template-creator-email-type">
                            {goals.find((g) => g.id === selectedGoal)?.name || 'Not selected'}
                          </div>
                          <div className="template-creator-description">
                            {goals.find((g) => g.id === selectedGoal)?.description || '...'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">
                        {selectedGoal === 'start_business' ? 'Business Type' : 'Internship Type'}
                      </h3>
                      <div className="template-creator-grid">
                        <div className="template-creator-card selected">
                          <img
                            src={typeIconBlue}
                            alt="Type icon"
                            className="template-creator-icon"
                          />
                          <div className="template-creator-email-type">
                            {(selectedGoal === 'start_business' ? businessTypes : internshipTypes).find(
                              (t) => t.id === selectedType
                            )?.name || 'Not selected'}
                          </div>
                          <div className="template-creator-description">
                            {(selectedGoal === 'start_business' ? businessTypes : internshipTypes).find(
                              (t) => t.id === selectedType
                            )?.description || '...'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">Breakfast Time</h3>
                      <div className="template-creator-grid">
                        <div className="template-creator-card selected">
                          <div className="template-creator-email-type">{breakfastTime || 'Not selected'}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">Lunch Time</h3>
                      <div className="template-creator-grid">
                        <div className="template-creator-card selected">
                          <div className="template-creator-email-type">{lunchTime || 'Not selected'}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">Dinner Time</h3>
                      <div className="template-creator-grid">
                        <div className="template-creator-card selected">
                          <div className="template-creator-email-type">{dinnerTime || 'Not selected'}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">Sleep Time</h3>
                      <div className="template-creator-grid">
                        <div className="template-creator-card selected">
                          <div className="template-creator-email-type">{sleepTime || 'Not selected'}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">Recurring Events</h3>
                      <div className="template-creator-grid">
                        {hasRecurringEvents === 'no' ? (
                          <div className="template-creator-card selected">
                            <div className="template-creator-email-type">No recurring events</div>
                          </div>
                        ) : (
                          recurringEvents.map((event, index) => (
                            <div key={index} className="template-creator-card selected">
                              <div className="template-creator-email-type">{event.eventType || 'Not selected'}</div>
                              <div className="template-creator-description">
                                {event.startTime && event.endTime
                                  ? `${event.startTime} - ${event.endTime}`
                                  : 'Time not selected'}
                                <br />
                                {event.days.length > 0 ? event.days.join(', ') : 'Days not selected'}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {(currentStep >= 1 && currentStep <= 8) && (
          <div className="template-creator-footer-container">
            <div className="template-creator-footer-text">
              Your schedule will be saved for planning purposes.
            </div>
            <div className="template-creator-navigation">
              <button
                className="template-creator-back-btn"
                onClick={handleBackStep}
                disabled={currentStep === 1}
              >
                Back
              </button>
              <button
                className="template-creator-next-btn"
                onClick={currentStep === 8 ? handlePublish : handleNextStep}
                disabled={
                  (currentStep === 1 && !selectedGoal) ||
                  (currentStep === 2 && !selectedType) ||
                  (currentStep === 3 && !breakfastTime) ||
                  (currentStep === 4 && !lunchTime) ||
                  (currentStep === 5 && !dinnerTime) ||
                  (currentStep === 6 && !sleepTime) ||
                  (currentStep === 7 &&
                    (!hasRecurringEvents ||
                      (hasRecurringEvents === 'yes' &&
                        !recurringEvents.every(
                          (event) =>
                            event.eventType && event.startTime && event.endTime && event.days.length > 0
                        )))) ||
                  (currentStep === 8 && (!workflowTitle.trim() || isPublishing))
                }
              >
                {currentStep === 8
                  ? isPublishing
                    ? 'Publishing...'
                    : 'Publish'
                  : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

TemplateCreator.propTypes = {
  userEmail: PropTypes.string.isRequired,
  handleBack: PropTypes.func.isRequired,
  templateName: PropTypes.string,
  onTemplateNameChange: PropTypes.func,
  templateData: PropTypes.object,
  setTemplateData: PropTypes.func,
  isPublishing: PropTypes.bool,
  setIsPublishing: PropTypes.func,
};

TemplateCreator.defaultProps = {
  templateName: '',
  templateData: {},
  onTemplateNameChange: () => {},
  setTemplateData: () => {},
  isPublishing: false,
  setIsPublishing: () => {},
};

export default TemplateCreator;