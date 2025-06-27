import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import './TemplateCreator.css';

// Step 1 icons (category selection)
import clientCommunicationsBlue from '/assets/client_communications_type_icon_scenario.png';
import clientCommunicationsGrey from '/assets/client_communications_type_icon_scenario.png';

// Step 2 icons (scenario selection)
import projectUpdateBlue from '/assets/project_status_update_type_icon_scenario.png';
import projectUpdateGrey from '/assets/project_status_update_type_icon_scenario.png';

// Step 3 icons (tone selection)
import clientCommunicationsBlueTone from '/assets/client_communications_type_icon_scenario.png';
import clientCommunicationsGreyTone from '/assets/client_communications_type_icon_scenario.png';
import coldSalesBlueTone from '/assets/cold_sales_pitch_type_icon_scenario.png';
import coldSalesGreyTone from '/assets/cold_sales_pitch_type_icon_scenario.png';

// Category icons mapping
const categoryIcons = {
  'Client communications': {
    blue: clientCommunicationsBlue,
    grey: clientCommunicationsGrey,
  },
  'Cold inbound': {
    blue: clientCommunicationsBlue,
    grey: clientCommunicationsGrey,
  },
};

// Tone icons mapping
const toneIcons = {
  professional: {
    blue: clientCommunicationsBlueTone,
    grey: clientCommunicationsGreyTone,
  },
  casual: {
    blue: coldSalesBlueTone,
    grey: coldSalesGreyTone,
  },
};

// Utility function to convert string to snake_case
const toSnakeCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

// Document and context options based on category and scenario
const categorySettings = {
  'Client communications': {
    defaultTitle: 'Client Communications Template',
    defaultTone: 'Communication',
    scenarios: {
      'Negotiation/project agreement': {
        description: 'Finalizing or amending the formal engagement documents',
        documents: [
          'Draft contract or Master Services Agreement (MSA)',
          'Redlined project versions',
          'Statement of Work (SOW) references',
          'Previous signed agreement',
        ],
        additionalContext: [
          'Current project timeline and capacity',
          'Budget constraints or requirements',
          'Stakeholder priorities or executive sponsorship',
          'Precedents for similar agreements',
        ],
      },
      'Scope change request/RFP': {
        description: 'Asking to expand, modify, or re-solicit work',
        documents: [
          'Original SOW or project charter',
          'Project plan or Gantt chart',
          'RFP document or questionnaire',
          'Requirements specification',
        ],
        additionalContext: [
          'Current project timeline and capacity',
          'Budget constraints or requirements',
          'Stakeholder priorities or executive sponsorship',
          'Precedents for similar change orders',
        ],
      },
    },
  },
  'Cold inbound': {
    defaultTitle: 'Cold Inbound Template',
    scenarios: {
      'Founder pitch': {
        description: 'Unsolicited outreach seeking capital, strategic partnerships, or pilots',
        documents: [
          'Investment thesis',
          'Pilot requirements',
          'Strategic partnership requirements',
        ],
        additionalContext: [
          'Target founder profile',
          'Firm’s sector focus or thesis',
          'Previous interactions',
          'Key metrics',
        ],
      },
      'Networking': {
        description: 'Seeking to establish rapport, gain insights, or explore collaboration',
        documents: [
          'Resume',
          'Personal bio',
          'Relevant case studies',
          'Portfolio',
        ],
        additionalContext: [
          'Preferred mutual contact names or referral sources',
          'Specific topics or questions to discuss',
          'Availability or preferred format',
          'Past interactions or shared events',
        ],
      },
    },
  },
};

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
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(templateData?.category || null);
  const [selectedScenarios, setSelectedScenarios] = useState(templateData?.scenarios || []);
  const [scenarioDetails, setScenarioDetails] = useState(templateData?.scenarioDetails || {});
  const [workflowTitle, setWorkflowTitle] = useState(templateName || '');
  const [workflowDescription, setWorkflowDescription] = useState(
    templateData?.workflowDescription || ''
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [direction, setDirection] = useState('next');

  const scrollableRef = useRef(null);

  const categories = ['Client communications', 'Cold inbound'];

  const tones = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Courtesy and formality',
    },
    {
      id: 'casual',
      name: 'Casual',
      description: 'Warm, approachable emails',
    },
  ];

  const greetings = ['Hi', 'Hey', 'Dear', 'Custom'];
  const signatures = ['Best', 'Sincerely', 'Cheers', 'Custom'];

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

  const getScenarios = useCallback((category) => {
    const settings = categorySettings[category] || {};
    return Object.keys(settings.scenarios || {}).map((key) => ({
      id: toSnakeCase(key),
      name: key,
      description: settings.scenarios[key].description,
    }));
  }, []);

  const handleCategorySelect = useCallback(
    (category) => {
      const snakeCaseCategory = toSnakeCase(category);
      setSelectedCategory(category);
      setSelectedScenarios([]);
      setScenarioDetails({});
      setTemplateData((prev) => ({
        ...prev,
        category: snakeCaseCategory,
        scenarios: [],
        scenarioDetails: {},
      }));
    },
    [setTemplateData]
  );

  const handleScenarioSelect = useCallback(
    (id) => {
      let updatedScenarios;
      let updatedDetails = { ...scenarioDetails };

      if (selectedScenarios.includes(id)) {
        updatedScenarios = [];
        delete updatedDetails[id];
      } else {
        updatedScenarios = [id];
        updatedDetails = {
          [id]: {
            tones: { selected: null },
            documents: [],
            additionalDocuments: [],
            context: { type: '', content: '', displayType: '' },
            signature: { greeting: 'Hi', signature: 'Best' },
            documentType: '',
            documentDisplayType: '',
          },
        };
      }

      setSelectedScenarios(updatedScenarios);
      setScenarioDetails(updatedDetails);
      setTemplateData((prev) => ({
        ...prev,
        scenarios: updatedScenarios,
        scenarioDetails: updatedDetails,
      }));
    },
    [selectedScenarios, scenarioDetails, setTemplateData]
  );

  const handleToneSelect = useCallback(
    (scenarioId, toneId) => {
      setScenarioDetails((prev) => ({
        ...prev,
        [scenarioId]: {
          ...prev[scenarioId],
          tones: {
            selected: prev[scenarioId]?.tones?.selected === toneId ? null : toneId,
          },
        },
      }));
      setTemplateData((prev) => ({
        ...prev,
        scenarioDetails: {
          ...prev.scenarioDetails,
          [scenarioId]: {
            ...prev.scenarioDetails[scenarioId],
            tones: {
              selected: prev.scenarioDetails[scenarioId]?.tones?.selected === toneId ? null : toneId,
            },
          },
        },
      }));
    },
    [setTemplateData]
  );

  const handleDocumentUpload = useCallback(
    (scenarioId, event, isAdditional = false) => {
      if (!event.target.files || event.target.files.length === 0) {
        setError('No files selected.');
        return;
      }

      const MAX_FILE_SIZE_MB = 25;
      const files = Array.from(event.target.files);
      const filePromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
            reject(new Error(`File ${file.name} exceeds ${MAX_FILE_SIZE_MB} MB`));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            if (!reader.result || typeof reader.result !== 'string') {
              reject(new Error(`Failed to read file: ${file.name}`));
              return;
            }
            const base64Data = reader.result.split(',')[1];
            if (!base64Data) {
              reject(new Error(`Invalid base64 data for file: ${file.name}`));
              return;
            }
            const doc = {
              name: encodeURIComponent(file.name),
              size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
              base64Data,
            };
            resolve(doc);
          };
          reader.onerror = () => {
            reject(new Error(`Error reading file: ${file.name}`));
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises)
        .then((newDocuments) => {
          setScenarioDetails((prev) => ({
            ...prev,
            [scenarioId]: {
              ...prev[scenarioId],
              [isAdditional ? 'additionalDocuments' : 'documents']: [
                ...(prev[scenarioId]?.[isAdditional ? 'additionalDocuments' : 'documents'] || []),
                ...newDocuments,
              ],
            },
          }));
          setTemplateData((prev) => ({
            ...prev,
            scenarioDetails: {
              ...prev.scenarioDetails,
              [scenarioId]: {
                ...prev.scenarioDetails[scenarioId],
                [isAdditional ? 'additionalDocuments' : 'documents']: [
                  ...(prev.scenarioDetails[scenarioId]?.[
                    isAdditional ? 'additionalDocuments' : 'documents'
                  ] || []),
                  ...newDocuments,
                ],
              },
            },
          }));
        })
        .catch((err) => {
          setError(`Failed to process uploaded files: ${err.message}`);
        });
    },
    [setTemplateData]
  );

  const handleDocumentTypeChange = useCallback(
    (scenarioId, documentType) => {
      const snakeCaseDocumentType = toSnakeCase(documentType);
      setScenarioDetails((prev) => ({
        ...prev,
        [scenarioId]: {
          ...prev[scenarioId],
          documentType: snakeCaseDocumentType,
          documentDisplayType: documentType,
        },
      }));
      setTemplateData((prev) => ({
        ...prev,
        scenarioDetails: {
          ...prev.scenarioDetails,
          [scenarioId]: {
            ...prev.scenarioDetails[scenarioId],
            documentType: snakeCaseDocumentType,
            documentDisplayType: documentType,
          },
        },
      }));
    },
    [setTemplateData]
  );

  const handleContextChange = useCallback(
    (scenarioId, field, value) => {
      if (field === 'type') {
        const snakeCaseValue = toSnakeCase(value);
        setScenarioDetails((prev) => ({
          ...prev,
          [scenarioId]: {
            ...prev[scenarioId],
            context: {
              ...prev[scenarioId]?.context,
              type: snakeCaseValue,
              displayType: value,
              content: prev[scenarioId]?.context?.content || '',
            },
          },
        }));
        setTemplateData((prev) => ({
          ...prev,
          scenarioDetails: {
            ...prev.scenarioDetails,
            [scenarioId]: {
              ...prev.scenarioDetails[scenarioId],
              context: {
                ...prev.scenarioDetails[scenarioId]?.context,
                type: snakeCaseValue,
                displayType: value,
                content: prev.scenarioDetails[scenarioId]?.context?.content || '',
              },
            },
          },
        }));
      } else {
        setScenarioDetails((prev) => ({
          ...prev,
          [scenarioId]: {
            ...prev[scenarioId],
            context: {
              ...prev[scenarioId]?.context,
              [field]: value,
            },
          },
        }));
        setTemplateData((prev) => ({
          ...prev,
          scenarioDetails: {
            ...prev.scenarioDetails,
            [scenarioId]: {
              ...prev.scenarioDetails[scenarioId],
              context: {
                ...prev.scenarioDetails[scenarioId]?.context,
                [field]: value,
              },
            },
          },
        }));
      }
    },
    [setTemplateData]
  );

  const handleSignatureChange = useCallback(
    (scenarioId, field, value) => {
      setScenarioDetails((prev) => ({
        ...prev,
        [scenarioId]: {
          ...prev[scenarioId],
          signature: {
            ...prev[scenarioId]?.signature,
            [field]: value,
          },
        },
      }));
      setTemplateData((prev) => ({
        ...prev,
        scenarioDetails: {
          ...prev.scenarioDetails,
          [scenarioId]: {
            ...prev.scenarioDetails[scenarioId],
            signature: {
              ...prev.scenarioDetails[scenarioId]?.signature,
              [field]: value,
            },
          },
        },
      }));
    },
    [setTemplateData]
  );

  const handleWorkflowTitleChange = useCallback(
    (e) => {
      const newTitle = e.target.value;
      setWorkflowTitle(newTitle);
      onTemplateNameChange({ target: { value: newTitle } });
      setTemplateData((prev) => ({ ...prev, workflowTitle: newTitle }));
    },
    [onTemplateNameChange, setTemplateData]
  );

  const handleWorkflowDescriptionChange = useCallback(
    (e) => {
      const newDescription = e.target.value;
      setWorkflowDescription(newDescription);
      setTemplateData((prev) => ({ ...prev, workflowDescription: newDescription }));
    },
    [setTemplateData]
  );

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && selectedCategory) {
      setDirection('next');
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedScenarios.length > 0) {
      setDirection('next');
      setCurrentStep(3);
    } else if (
      currentStep === 3 &&
      selectedScenarios.every((scenarioId) => {
        const toneDetails = scenarioDetails[scenarioId]?.tones;
        return toneDetails?.selected;
      })
    ) {
      setDirection('next');
      setCurrentStep(4);
      setTemplateData((prev) => ({ ...prev, scenarioDetails }));
    } else if (currentStep === 4) {
      setDirection('next');
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setDirection('next');
      setCurrentStep(6);
    } else if (
      currentStep === 6 &&
      selectedScenarios.every(
        (scenarioId) =>
          scenarioDetails[scenarioId]?.signature?.greeting &&
          scenarioDetails[scenarioId]?.signature?.signature
      )
    ) {
      setDirection('next');
      setCurrentStep(7);
    } else if (currentStep === 7 && workflowTitle.trim()) {
      setDirection('next');
      setCurrentStep(8);
    } else {
      setError('Please complete the required fields to proceed.');
    }
  }, [
    currentStep,
    selectedCategory,
    selectedScenarios,
    scenarioDetails,
    workflowTitle,
    setTemplateData,
  ]);

  const handleBackStep = useCallback(() => {
    if (currentStep > 1) {
      setDirection('back');
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  }, [currentStep]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    setError(null);

    const payload = {
      userEmail,
      templateName: workflowTitle,
      category: toSnakeCase(selectedCategory),
      scenarios: selectedScenarios,
      scenarioDetails: Object.fromEntries(
        Object.entries(scenarioDetails).map(([scenarioId, details]) => [
          scenarioId,
          {
            ...details,
            documentType: details.documentType,
            context: {
              type: details.context?.type,
              content: details.context?.content || '',
            },
            signature: {
              greeting: details.signature?.greeting || 'Hi',
              signature: details.signature?.signature || 'Best',
              customGreeting: details.signature?.customGreeting || '',
              customSignature: details.signature?.customSignature || '',
            },
          },
        ])
      ),
      workflowTitle,
      workflowDescription,
    };

    try {
      const response = await fetch(
        'https://2ofjdl14kg.execute-api.us-east-1.amazonaws.com/prod/publish',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
      setSelectedCategory(null);
      setSelectedScenarios([]);
      setScenarioDetails({});
      setWorkflowTitle('');
      setWorkflowDescription('');
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
    selectedCategory,
    selectedScenarios,
    scenarioDetails,
    workflowDescription,
    handleBack,
    setTemplateData,
  ]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Select email category';
      case 2:
        return 'Select scenarios';
      case 3:
        return 'Select tone';
      case 4:
        return 'Upload documents';
      case 5:
        return 'Add context';
      case 6:
        return 'Configure signature';
      case 7:
        return 'Title and description';
      case 8:
        return 'Review';
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
            <h3 className="template-creator-step-title">
              What type of email will your agent reply to?
            </h3>
          )}
          {currentStep === 2 && (
            <h3 className="template-creator-step-title">
              What type of scenario will you reply to?
            </h3>
          )}
          {currentStep === 3 && (
            <h3 className="template-creator-step-title step-3-title">Select tone for reply</h3>
          )}
          {currentStep === 4 && (
            <h3 className="template-creator-step-title">
              Attach documents if specific information is needed{' '}
              <span style={{ color: '#9CA3AF' }}>(optional)</span>
            </h3>
          )}
          {currentStep === 5 && (
            <h3 className="template-creator-step-title">Provide additional context <span style={{ color: '#9CA3AF' }}>(optional)</span></h3>
          )}
          {currentStep === 6 && (
            <h3 className="template-creator-step-title">Configure email signature</h3>
          )}
          {currentStep === 7 && (
            <h3 className="template-creator-step-title">Title this Agent</h3>
          )}
          {currentStep === 8 && (
            <h3 className="template-creator-step-title">Identifying information</h3>
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
                    {categories.map((category) => (
                      <div
                        key={category}
                        className={`template-creator-card ${
                          selectedCategory === category ? 'selected' : ''
                        }`}
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="template-creator-card-content">
                          <img
                            src={
                              selectedCategory === category
                                ? categoryIcons[category].blue
                                : categoryIcons[category].grey
                            }
                            alt={`${category} icon`}
                            className="template-creator-icon"
                          />
                          <div className="template-creator-email-type">{category}</div>
                          <div className="template-creator-description">
                            {category === 'Client communications'
                              ? 'Project or account-related emails covering deliverables, feedback, change requests, etc.'
                              : 'Senders proposing services, partnerships, investment, or requests to connect for networking'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="template-creator-grid">
                    {getScenarios(selectedCategory).map((scenario) => (
                      <div
                        key={scenario.id}
                        className={`template-creator-card ${
                          selectedScenarios.includes(scenario.id) ? 'selected' : ''
                        }`}
                        onClick={() => handleScenarioSelect(scenario.id)}
                      >
                        <div className="template-creator-card-content">
                          <img
                            src={
                              selectedScenarios.includes(scenario.id)
                                ? projectUpdateBlue
                                : projectUpdateGrey
                            }
                            alt="Scenario email icon"
                            className="template-creator-icon"
                          />
                          <div className="template-creator-email-type">{scenario.name}</div>
                          <div className="template-creator-description">{scenario.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="template-creator-grid">
                    {selectedScenarios.map((scenarioId) =>
                      tones.map((tone) => {
                        const details = scenarioDetails[scenarioId] || {};
                        return (
                          <div
                            key={`${scenarioId}-${tone.id}`}
                            className={`template-creator-card ${
                              details.tones?.selected === tone.id ? 'selected' : ''
                            }`}
                            onClick={() => handleToneSelect(scenarioId, tone.id)}
                          >
                            <div className="template-creator-card-content">
                              <img
                                src={
                                  details.tones?.selected === tone.id
                                    ? toneIcons[tone.id].blue
                                    : toneIcons[tone.id].grey
                                }
                                alt={`${tone.name} tone icon`}
                                className="template-creator-icon"
                              />
                              <div className="template-creator-email-type">{tone.name}</div>
                              <div className="template-creator-description">
                                {tone.description}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="template-creator-selected-scenarios-section">
                    <div className="template-creator-selected-scenarios-list">
                      {selectedScenarios.map((scenarioId, index) => {
                        const scenario = getScenarios(selectedCategory).find(
                          (s) => s.id === scenarioId
                        );
                        const details = scenarioDetails[scenarioId] || {};
                        const documentOptions =
                          categorySettings[selectedCategory]?.scenarios[scenario?.name]
                            ?.documents || [];
                        return (
                          <React.Fragment key={scenarioId}>
                            <div>
                              <div className="template-creator-context-section">
                                <h4 className="template-creator-context-title">Document type</h4>
                                <div className="template-creator-dropdown-wrapper">
                                  <select
                                    className="template-creator-dropdown"
                                    value={details.documentDisplayType || ''}
                                    onChange={(e) =>
                                      handleDocumentTypeChange(scenarioId, e.target.value)
                                    }
                                  >
                                    <option value="">Select document type</option>
                                    {documentOptions.map((doc, idx) => (
                                      <option key={idx} value={doc}>
                                        {doc}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {details.documentType && (
                                  <>
                                    <h4 className="template-creator-context-title">Document</h4>
                                    <div className="template-creator-attachment-card">
                                      <label
                                        htmlFor={`file-upload-${scenarioId}`}
                                        className="template-creator-attachment-label"
                                      >
                                        <div className="template-creator-attachment-info">
                                          <div>Upload document</div>
                                          <div className="template-creator-description">
                                            Click to upload file
                                          </div>
                                        </div>
                                      </label>
                                      <input
                                        id={`file-upload-${scenarioId}`}
                                        type="file"
                                        onChange={(e) => handleDocumentUpload(scenarioId, e)}
                                        className="template-creator-file-input"
                                        multiple
                                      />
                                    </div>
                                    {(details.documents || []).map((doc, idx) => (
                                      <div
                                        key={idx}
                                        className="template-creator-document-card selected"
                                      >
                                        <div className="template-creator-document-name">
                                          {decodeURIComponent(doc.name)}
                                        </div>
                                        <div className="template-creator-document-size">{doc.size}</div>
                                      </div>
                                    ))}
                                    <button
                                      className="template-creator-upload-more-btn"
                                      onClick={() => document.getElementById(`file-upload-${scenarioId}`).click()}
                                    >
                                      Upload more
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            {index < selectedScenarios.length - 1 && (
                              <div className="template-creator-section-divider" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="template-creator-selected-scenarios-section">
                    <div className="template-creator-selected-scenarios-list">
                      {selectedScenarios.map((scenarioId, index) => {
                        const scenario = getScenarios(selectedCategory).find(
                          (s) => s.id === scenarioId
                        );
                        const details = scenarioDetails[scenarioId] || {};
                        const contextOptions =
                          categorySettings[selectedCategory]?.scenarios[scenario?.name]
                            ?.additionalContext || [];
                        return (
                          <React.Fragment key={scenarioId}>
                            <div>
                              <div className="template-creator-context-section">
                                <h4 className="template-creator-context-title">
                                  Select context type
                                </h4>
                                <div className="template-creator-dropdown-wrapper">
                                  <select
                                    className="template-creator-dropdown"
                                    value={details.context?.displayType || ''}
                                    onChange={(e) =>
                                      handleContextChange(scenarioId, 'type', e.target.value)
                                    }
                                  >
                                    <option value="">Select context type</option>
                                    {contextOptions.map((context, idx) => (
                                      <option key={idx} value={context}>
                                        {context}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {details.context?.type && (
                                  <>
                                    <h4 className="template-creator-context-title">Context</h4>
                                    <div className="template-creator-input-wrapper">
                                      <textarea
                                        className="template-creator-instructions-input"
                                        placeholder="Add context"
                                        value={details.context?.content || ''}
                                        onChange={(e) =>
                                          handleContextChange(scenarioId, 'content', e.target.value)
                                        }
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            {index < selectedScenarios.length - 1 && (
                              <div className="template-creator-section-divider" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="template-creator-selected-scenarios-section">
                    <div className="template-creator-selected-scenarios-list">
                      {selectedScenarios.map((scenarioId, index) => {
                        const details = scenarioDetails[scenarioId] || {};
                        return (
                          <React.Fragment key={scenarioId}>
                            <div>
                              <div className="template-creator-context-section">
                                <h4 className="template-creator-context-title">Select greeting</h4>
                                <div className="template-creator-dropdown-wrapper">
                                  <select
                                    className="template-creator-dropdown"
                                    value={details.signature?.greeting || 'Hi'}
                                    onChange={(e) =>
                                      handleSignatureChange(scenarioId, 'greeting', e.target.value)
                                    }
                                  >
                                    {greetings.map((greeting) => (
                                      <option key={greeting} value={greeting}>
                                        {greeting}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {details.signature?.greeting === 'Custom' && (
                                  <div className="template-creator-input-wrapper">
                                    <textarea
                                      className="template-creator-instructions-input"
                                      placeholder="Enter custom greeting"
                                      value={details.signature?.customGreeting || ''}
                                      onChange={(e) =>
                                        handleSignatureChange(
                                          scenarioId,
                                          'customGreeting',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                )}
                                <div className="template-creator-divider-label">
                                </div>
                                <h4 className="template-creator-context-title">Select signature</h4>
                                <div className="template-creator-dropdown-wrapper">
                                  <select
                                    className="template-creator-dropdown"
                                    value={details.signature?.signature || 'Best'}
                                    onChange={(e) =>
                                      handleSignatureChange(scenarioId, 'signature', e.target.value)
                                    }
                                  >
                                    {signatures.map((sig) => (
                                      <option key={sig} value={sig}>
                                        {sig}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {details.signature?.signature === 'Custom' && (
                                  <div className="template-creator-input-wrapper">
                                    <textarea
                                      className="template-creator-instructions-input"
                                      placeholder="Enter custom signature"
                                      value={details.signature?.customSignature || ''}
                                      onChange={(e) =>
                                        handleSignatureChange(
                                          scenarioId,
                                          'customSignature',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            {index < selectedScenarios.length - 1 && (
                              <hr className="template-creator-section-divider" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="template-creator-title-section">
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
                    <div className="template-creator-divider-label">
                    </div>
                    <h3 className="template-creator-review-title">Description</h3>
                    <div className="template-creator-input-wrapper">
                      <textarea
                        className="template-creator-description-input"
                        placeholder="Add a description for your workflow"
                        value={workflowDescription}
                        onChange={handleWorkflowDescriptionChange}
                      />
                    </div>
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
                      <h3 className="template-creator-review-title">Description</h3>
                      <div className="template-creator-input-wrapper">
                        <textarea
                          className="template-creator-description-input"
                          placeholder="Add a description for your workflow"
                          value={workflowDescription}
                          onChange={handleWorkflowDescriptionChange}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">Email category</h3>
                      <div className="template-creator-grid">
                        <div className="template-creator-card selected">
                          <img
                            src={categoryIcons[selectedCategory]?.blue}
                            alt={`${selectedCategory} icon`}
                            className="template-creator-icon"
                          />
                          <div className="template-creator-email-type">
                            {selectedCategory || 'Not selected'}
                          </div>
                          <div className="template-creator-description">
                            {selectedCategory === 'Client communications'
                              ? 'Ongoing project or account-related emails from existing clients, covering deliverables, feedback, change requests, etc.'
                              : selectedCategory === 'Cold inbound'
                              ? 'Senders proposing services, partnerships, investment, or requests to connect for networking'
                              : '...'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="template-creator-review-title">Scenarios</h3>
                      <div className="template-creator-grid">
                        {selectedScenarios.map((scenarioId) => {
                          const scenario = getScenarios(selectedCategory).find(
                            (s) => s.id === scenarioId
                          );
                          return (
                            <div key={scenarioId} className="template-creator-card selected">
                              <img
                                src={projectUpdateBlue}
                                alt="Scenario email icon"
                                className="template-creator-icon"
                              />
                              <div className="template-creator-email-type">
                                {scenario?.name || 'Unknown Scenario'}
                              </div>
                              <div className="template-creator-description">
                                {scenario?.description || 'No description available'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {selectedScenarios.map((scenarioId) => {
                      const scenario = getScenarios(selectedCategory).find(
                        (s) => s.id === scenarioId
                      );
                      const details = scenarioDetails[scenarioId] || {};
                      const documentOptions =
                        categorySettings[selectedCategory]?.scenarios[scenario?.name]?.documents ||
                        [];
                      const contextOptions =
                        categorySettings[selectedCategory]?.scenarios[scenario?.name]
                          ?.additionalContext || [];
                      return (
                        <React.Fragment key={scenarioId}>
                          <div>
                            <h3 className="template-creator-review-title">Tone</h3>
                            <div className="template-creator-grid">
                              {(() => {
                                const selectedTone = tones.find(
                                  (tone) => tone.id === details.tones?.selected
                                );
                                if (!selectedTone) {
                                  return (
                                    <div className="template-creator-card">
                                      <div className="template-creator-email-type">No tone selected</div>
                                      <div className="template-creator-description">
                                        Please select a tone for this scenario.
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <div
                                    className="template-creator-card selected"
                                    onClick={() => handleToneSelect(scenarioId, selectedTone.id)}
                                  >
                                    <img
                                      src={toneIcons[selectedTone.id].blue}
                                      alt={`${selectedTone.name} tone icon`}
                                      className="template-creator-icon"
                                    />
                                    <div className="template-creator-email-type">{selectedTone.name}</div>
                                    <div className="template-creator-description">
                                      {selectedTone.description}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                          <div>
                            <h3 className="template-creator-review-title">Documents</h3>
                            <div className="template-creator-grid">
                              <div className="template-creator-card">
                                <div className="template-creator-dropdown-wrapper">
                                  <select
                                    className="template-creator-dropdown"
                                    value={details.documentDisplayType || ''}
                                    onChange={(e) =>
                                      handleDocumentTypeChange(scenarioId, e.target.value)
                                    }
                                  >
                                    <option value="">Select document type</option>
                                    {documentOptions.map((doc, idx) => (
                                      <option key={idx} value={doc}>
                                        {doc}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {details.documentType && (
                                  <div className="template-creator-attachment-card">
                                    <label
                                      htmlFor={`file-upload-review-${scenarioId}`}
                                      className="template-creator-attachment-label"
                                    >
                                      <div className="template-creator-attachment-info">
                                        <div>Upload document</div>
                                        <div className="template-creator-description">
                                          Click to upload file
                                        </div>
                                      </div>
                                    </label>
                                    <input
                                      id={`file-upload-review-${scenarioId}`}
                                      type="file"
                                      onChange={(e) => handleDocumentUpload(scenarioId, e)}
                                      className="template-creator-file-input"
                                      multiple
                                    />
                                  </div>
                                )}
                                {(details.documents || []).map((doc, idx) => (
                                  <div
                                    key={idx}
                                    className="template-creator-document-card selected"
                                  >
                                    <div className="template-creator-document-name">
                                      {decodeURIComponent(doc.name)}
                                    </div>
                                    <div className="template-creator-document-size">{doc.size}</div>
                                  </div>
                                ))}
                                <div className="template-creator-attachment-card">
                                  <label
                                    htmlFor={`additional-file-upload-review-${scenarioId}`}
                                    className="template-creator-attachment-label"
                                  >
                                    <div className="template-creator-attachment-info">
                                      <div>Upload additional document</div>
                                      <div className="template-creator-description">
                                        Click to upload additional file
                                      </div>
                                    </div>
                                  </label>
                                  <input
                                    id={`additional-file-upload-review-${scenarioId}`}
                                    type="file"
                                    onChange={(e) => handleDocumentUpload(scenarioId, e, true)}
                                    className="template-creator-file-input"
                                    multiple
                                  />
                                </div>
                                {(details.additionalDocuments || []).map((doc, idx) => (
                                  <div
                                    key={idx}
                                    className="template-creator-document-card selected"
                                  >
                                    <div className="template-creator-document-name">
                                      {decodeURIComponent(doc.name)}
                                    </div>
                                    <div className="template-creator-document-size">{doc.size}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="template-creator-review-title">Context</h3>
                            <div className="template-creator-grid">
                              <div className="template-creator-card">
                                <div className="template-creator-dropdown-wrapper">
                                  <select
                                    className="template-creator-dropdown"
                                    value={details.context?.displayType || ''}
                                    onChange={(e) =>
                                      handleContextChange(scenarioId, 'type', e.target.value)
                                    }
                                  >
                                    <option value="">Select context type</option>
                                    {contextOptions.map((context, idx) => (
                                      <option key={idx} value={context}>
                                        {context}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {details.context?.type && (
                                  <div className="template-creator-input-wrapper">
                                    <textarea
                                      className="template-creator-instructions-input"
                                      placeholder="Add additional context"
                                      value={details.context?.content || ''}
                                      onChange={(e) =>
                                        handleContextChange(scenarioId, 'content', e.target.value)
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="template-creator-review-title">Salutation</h3>
                            <div className="template-creator-grid">
                              <div className="template-creator-card">
                                <div className="template-creator-email-type">Greeting</div>
                                <div className="template-creator-dropdown-wrapper">
                                  <select
                                    className="template-creator-dropdown"
                                    value={details.signature?.greeting || 'Hi'}
                                    onChange={(e) =>
                                      handleSignatureChange(scenarioId, 'greeting', e.target.value)
                                    }
                                  >
                                    {greetings.map((greeting) => (
                                      <option key={greeting} value={greeting}>
                                        {greeting}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {details.signature?.greeting === 'Custom' && (
                                  <div className="template-creator-input-wrapper">
                                    <textarea
                                      className="template-creator-instructions-input"
                                      placeholder="Enter custom greeting"
                                      value={details.signature?.customGreeting || ''}
                                      onChange={(e) =>
                                        handleSignatureChange(
                                          scenarioId,
                                          'customGreeting',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                )}
                                <div className="template-creator-email-type">Signature</div>
                                <div className="template-creator-dropdown-wrapper">
                                  <select
                                    className="template-creator-dropdown"
                                    value={details.signature?.signature || 'Best'}
                                    onChange={(e) =>
                                      handleSignatureChange(scenarioId, 'signature', e.target.value)
                                    }
                                  >
                                    {signatures.map((sig) => (
                                      <option key={sig} value={sig}>
                                        {sig}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {details.signature?.signature === 'Custom' && (
                                  <div className="template-creator-input-wrapper">
                                    <textarea
                                      className="template-creator-instructions-input"
                                      placeholder="Enter custom signature"
                                      value={details.signature?.customSignature || ''}
                                      onChange={(e) =>
                                        handleSignatureChange(
                                          scenarioId,
                                          'customSignature',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {(currentStep >= 1 && currentStep <= 8) && (
          <div className="template-creator-footer-container">
            <div className="template-creator-footer-text">
              Replies are written to the drafts of your linked account.
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
                  (currentStep === 1 && !selectedCategory) ||
                  (currentStep === 2 && selectedScenarios.length === 0) ||
                  (currentStep === 3 &&
                    !selectedScenarios.every(
                      (scenarioId) => scenarioDetails[scenarioId]?.tones?.selected
                    )) ||
                  (currentStep === 6 &&
                    !selectedScenarios.every(
                      (scenarioId) =>
                        scenarioDetails[scenarioId]?.signature?.greeting &&
                        scenarioDetails[scenarioId]?.signature?.signature
                    )) ||
                  (currentStep === 7 && !workflowTitle.trim()) ||
                  (currentStep === 8 && isPublishing)
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
};

TemplateCreator.defaultProps = {
  templateName: '',
  templateData: {},
  onTemplateNameChange: () => {},
  setTemplateData: () => {},
};

export default TemplateCreator;