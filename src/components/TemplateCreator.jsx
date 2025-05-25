import React, { useState } from 'react';
import './TemplateCreator.css';

const EmailScenarioSelector = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmailType, setSelectedEmailType] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [customScenarioDescription, setCustomScenarioDescription] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [workflowTitle, setWorkflowTitle] = useState('My title');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [attachedDocuments, setAttachedDocuments] = useState([
    { name: 'Document title', size: '51.43 MB' },
  ]);

  // Dummy data for email types
  const emailTypes = [...Array(8)].map((_, index) => ({
    id: index + 1,
    name: 'Email type',
    description: 'Description of email type, maybe another line',
  }));

  // Dummy data for scenarios
  const scenarios = [
    { id: 1, name: 'Scenario 1', description: 'Description of scenario, maybe another line' },
    { id: 2, name: 'Scenario 2', description: 'Description of scenario, maybe another line' },
    { id: 3, name: 'Scenario 3', description: 'Description of scenario, maybe another line' },
    { id: 4, name: 'Custom scenario', description: 'Create your own scenario, maybe another line' },
  ];

  // Dummy data for tones
  const tones = [
    { id: 1, name: 'Tone 1', description: 'Description of tone, maybe another line' },
    { id: 2, name: 'Tone 2', description: 'Description of tone, maybe another line' },
    { id: 3, name: 'Tone 3', description: 'Description of tone, maybe another line' },
    { id: 4, name: 'Tone 4', description: 'Description of tone, maybe another line' },
  ];

  const handleEmailTypeSelect = (id) => setSelectedEmailType(id);
  const handleScenarioSelect = (id) => setSelectedScenario(id);
  const handleToneSelect = (id) => setSelectedTone(id);

  const handleNextStep = () => {
    if (currentStep === 1 && selectedEmailType) setCurrentStep(2);
    else if (currentStep === 2 && selectedScenario) setCurrentStep(3);
    else if (currentStep === 3 && selectedTone) setCurrentStep(4);
    else if (currentStep === 4) setCurrentStep(5);
  };

  const handleBackStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    if (currentStep === 2) setSelectedScenario(null);
    if (currentStep === 3) setSelectedTone(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select type of email reply';
      case 2: return 'Select type of email reply';
      case 3: return 'Select type of email reply';
      case 4: return 'Create title';
      case 5: return 'Review';
      default: return '';
    }
  };

  return (
    <div className="selector-container">
      {/* Header and Step Indicator */}
      <div className="header">
        <span className="title">{getStepTitle()}</span>
        <span className="step">Step {currentStep} of 5</span>
      </div>

      {/* Step 1: Select Email Type */}
      {currentStep === 1 && (
        <>
          <h2 className="question">WHAT TYPE OF EMAIL WILL YOU REPLY TO?</h2>
          <div className="email-grid">
            {emailTypes.map((emailType) => (
              <div
                key={emailType.id}
                className={`email-card ${selectedEmailType === emailType.id ? 'selected' : ''}`}
                onClick={() => handleEmailTypeSelect(emailType.id)}
              >
                <div className="icon">📧</div>
                <div className="email-type">{emailType.name}</div>
                <div className="description">{emailType.description}</div>
              </div>
            ))}
          </div>
          <div className="navigation">
            <button className="back-btn" onClick={handleBackStep} disabled>
              Back
            </button>
            <button className="next-btn" onClick={handleNextStep} disabled={!selectedEmailType}>
              Select
            </button>
          </div>
        </>
      )}

      {/* Step 2: Select Scenario */}
      {currentStep === 2 && (
        <>
          <h2 className="title">Select scenarios to reply to</h2>
          <div className="scenario-grid">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`scenario-card ${selectedScenario === scenario.id ? 'selected' : ''}`}
                onClick={() => handleScenarioSelect(scenario.id)}
              >
                <div className="icon">📧</div>
                <div className="scenario-type">{scenario.name}</div>
                <div className="description">{scenario.description}</div>
              </div>
            ))}
          </div>
          {selectedScenario === 4 && (
            <div className="description-section">
              <h3 className="description-title">Description</h3>
              <textarea
                className="description-input"
                placeholder="CREATE YOUR OWN REQUIREMENTS TO CATEGORIZE THIS PARTICULAR TYPE OF EMAIL"
                value={customScenarioDescription}
                onChange={(e) => setCustomScenarioDescription(e.target.value)}
              />
            </div>
          )}
          <div className="navigation">
            <button className="back-btn" onClick={handleBackStep}>
              Back
            </button>
            <button className="next-btn" onClick={handleNextStep} disabled={!selectedScenario}>
              Next
            </button>
          </div>
        </>
      )}

      {/* Step 3: Personalize Reply */}
      {currentStep === 3 && (
        <>
          <h2 className="title">
            Personalize your reply - {scenarios.find(s => s.id === selectedScenario)?.name}
          </h2>
          <div className="tone-grid">
            {tones.map((tone) => (
              <div
                key={tone.id}
                className={`tone-card ${selectedTone === tone.id ? 'selected' : ''}`}
                onClick={() => handleToneSelect(tone.id)}
              >
                <div className="icon">📧</div>
                <div className="tone-type">{tone.name}</div>
                <div className="description">{tone.description}</div>
              </div>
            ))}
          </div>
          <div className="context-section">
            <h3 className="context-title">Provide context</h3>
            <div className="attachment-card">
              <div className="icon">📧</div>
              <div className="attachment-info">
                <div>Attach documents</div>
                <div className="description">REFERRED TO WHEN WRITING THE EMAIL</div>
              </div>
            </div>
            {attachedDocuments.map((doc, index) => (
              <div key={index} className="document-card selected">
                <div className="document-name">{doc.name}</div>
                <div className="document-size">{doc.size}</div>
              </div>
            ))}
            <h3 className="instructions-title">Additional instructions (optional)</h3>
            <textarea
              className="instructions-input"
              placeholder="ADD ANY ADDITIONAL REQUIREMENTS TO CATEGORIZE THIS PARTICULAR TYPE OF EMAIL"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
            />
          </div>
          <div className="navigation">
            <button className="back-btn" onClick={handleBackStep}>
              Back
            </button>
            <button className="next-btn" onClick={handleNextStep} disabled={!selectedTone}>
              Next
            </button>
          </div>
        </>
      )}

      {/* Step 4: Title Workflow */}
      {currentStep === 4 && (
        <>
          <h2 className="title">Title this workflow</h2>
          <div className="title-section">
            <h3 className="title-label">Title</h3>
            <input
              type="text"
              className="title-input"
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
            />
            <h3 className="description-label">Description</h3>
            <textarea
              className="description-input"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
            />
          </div>
          <div className="navigation">
            <button className="back-btn" onClick={handleBackStep}>
              Back
            </button>
            <button className="next-btn" onClick={handleNextStep}>
              Next
            </button>
          </div>
        </>
      )}

      {/* Step 5: Review Workflow */}
      {currentStep === 5 && (
        <>
          <h2 className="title">Review workflow</h2>
          <div className="review-section">
            <h3 className="review-title">Title</h3>
            <input type="text" className="review-input" value={workflowTitle} disabled />
            <h3 className="review-title">Description</h3>
            <textarea className="review-input" value={workflowDescription} disabled />
            <h3 className="review-title">Type of email replied to</h3>
            <div className="review-card">
              <div className="icon">📧</div>
              <div className="review-type">{emailTypes.find(e => e.id === selectedEmailType)?.name}</div>
              <div className="description">{emailTypes.find(e => e.id === selectedEmailType)?.description}</div>
            </div>
            <div className="review-grid">
              <div className="review-card">
                <div className="icon">📧</div>
                <div className="review-type">{scenarios.find(s => s.id === selectedScenario)?.name}</div>
                <div className="description">{customScenarioDescription || scenarios.find(s => s.id === selectedScenario)?.description}</div>
              </div>
              <div className="review-card">
                <div className="icon">📧</div>
                <div className="review-type">{tones.find(t => t.id === selectedTone)?.name}</div>
                <div className="description">{tones.find(t => t.id === selectedTone)?.description}</div>
              </div>
              {attachedDocuments.map((doc, index) => (
                <div key={index} className="review-document-card selected">
                  <div className="document-name">{doc.name}</div>
                  <div className="document-size">{doc.size}</div>
                </div>
              ))}
            </div>
            {additionalInstructions && (
              <>
                <h3 className="review-title">Additional requirements to categorize this particular type of email</h3>
                <textarea className="review-input" value={additionalInstructions} disabled />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EmailScenarioSelector;