import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import './WelcomeAgentCreator.css';

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

// Logo for header
import logo from '/assets/logo_colors_3d.png';

// Category icons mapping
const optionIcons = {
  'Client communications': { blue: clientCommunicationsBlue, grey: clientCommunicationsGrey },
  'Cold inbound': { blue: clientCommunicationsBlue, grey: clientCommunicationsGrey },
};

// Tone icons mapping
const toneIcons = {
  professional: { blue: clientCommunicationsBlueTone, grey: clientCommunicationsGreyTone },
  casual: { blue: coldSalesBlueTone, grey: coldSalesGreyTone },
};

// Options for step 1 (categories)
const options = [
  {
    id: 'client_communications',
    name: 'Client communications',
    description: 'Project or account-related emails covering deliverables, feedback, change requests, etc.',
  },
  {
    id: 'cold_inbound',
    name: 'Cold inbound',
    description: 'Senders proposing services, partnerships, investment, or requests to connect for networking',
  },
];

// Tone options for step 3
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

// Document and context options based on category and scenario
const categorySettings = {
  'Client communications': {
    defaultTitle: 'Client Communications Template',
    defaultTone: 'Professional',
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
    defaultTone: 'Professional',
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

// Utility function to convert string to snake_case
const toSnakeCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
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

const WelcomeAgentCreator = ({
  userEmail,
  templateName,
  onTemplateNameChange,
  templateData,
  setTemplateData,
}) => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(templateData?.category || null);
  const [selectedScenarios, setSelectedScenarios] = useState(templateData?.scenarios || []);
  const [scenariosDetails, setScenariosDetails] = useState(templateData?.details || {});
  const [workflowsTitle, setWorkflowsTitle] = useState(templateName || '');
  const [workflowsDescription, setWorkflowsDescription] = useState(templateData?.desc || '');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [direction, setDirection] = useState('next');

  const scrollableRef = useRef(null);

  const greetings = ['Hi', 'Hey', 'Dear', 'Custom'];
  const signatures = ['Best', 'Sincerely', 'Cheers', 'Custom'];

  // Track scroll events
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

  const handleCategorySelect = useCallback((category) => {
    const snakeCaseCategory = toSnakeCase(category);
    setSelectedCategory(category);
    setSelectedScenarios([]);
    setScenariosDetails({});
    setTemplateData((prev) => ({
      ...prev,
      category: snakeCaseCategory,
      scenarios: [],
      details: {},
    }));
  }, [setTemplateData]);

  const handleScenarioSelect = useCallback((id) => {
    let updatedScenarios;
    let updatedDetails = { ...scenariosDetails };

    if (selectedScenarios.includes(id)) {
      updatedScenarios = [];
      delete updatedDetails[id];
    } else {
      updatedScenarios = [id];
      updatedDetails = {
        [id]: {
          tones: { selected: null },
          documents: [],
          additional_documents: [],
          context: { type: '', content: '', display_type: '' },
          signature: { greeting: 'Hi', signature: 'Best' },
          document_type: '',
          document_display_type: '',
        },
      };
    }

    setSelectedScenarios(updatedScenarios);
    setScenariosDetails(updatedDetails);
    setTemplateData((prev) => ({
      ...prev,
      scenarios: updatedScenarios,
      details: updatedDetails,
    }));
  }, [selectedScenarios, scenariosDetails, setTemplateData]);

  const handleToneSelect = useCallback((scenarioId, toneId) => {
    setScenariosDetails((prev) => ({
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
      details: {
        ...prev.details,
        [scenarioId]: {
          ...prev.details[scenarioId],
          tones: {
            selected: prev.details[scenarioId]?.tones?.selected === toneId ? null : toneId,
          },
        },
      },
    }));
  }, [setTemplateData]);

  const handleDocumentUpload = useCallback((scenarioId, event, isAdditional = false) => {
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
        setScenariosDetails((prev) => ({
          ...prev,
          [scenarioId]: {
            ...prev[scenarioId],
            [isAdditional ? 'additional_documents' : 'documents']: [
              ...(prev[scenarioId]?.[isAdditional ? 'additional_documents' : 'documents'] || []),
              ...newDocuments,
            ],
          },
        }));
        setTemplateData((prev) => ({
          ...prev,
          details: {
            ...prev.details,
            [scenarioId]: {
              ...prev.details[scenarioId],
              [isAdditional ? 'additional_documents' : 'documents']: [
                ...(prev.details[scenarioId]?.[isAdditional ? 'additional_documents' : 'documents'] || []),
                ...newDocuments,
              ],
            },
          },
        }));
      })
      .catch((err) => {
        setError(`Failed to process uploaded files: ${err.message}`);
      });
  }, [setTemplateData]);

  const handleDocumentTypeChange = useCallback((scenarioId, documentType) => {
    const snakeCaseDocumentType = toSnakeCase(documentType);
    setScenariosDetails((prev) => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        document_type: snakeCaseDocumentType,
        document_display_type: documentType,
      },
    }));
    setTemplateData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [scenarioId]: {
          ...prev.details[scenarioId],
          document_type: snakeCaseDocumentType,
          document_display_type: documentType,
        },
      },
    }));
  }, [setTemplateData]);

  const handleContextChange = useCallback((scenarioId, field, value) => {
    setScenariosDetails((prev) => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        context: {
          ...prev[scenarioId]?.context,
          [field]: field === 'type' ? toSnakeCase(value) : value,
          ...(field === 'type' ? { display_type: value } : {}),
        },
      },
    }));
    setTemplateData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [scenarioId]: {
          ...prev.details[scenarioId],
          context: {
            ...prev.details[scenarioId]?.context,
            [field]: field === 'type' ? toSnakeCase(value) : value,
            ...(field === 'type' ? { display_type: value } : {}),
          },
        },
      },
    }));
  }, [setTemplateData]);

  const handleSignatureChange = useCallback((scenarioId, field, value) => {
    setScenariosDetails((prev) => ({
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
      details: {
        ...prev.details,
        [scenarioId]: {
          ...prev.details[scenarioId],
          signature: {
            ...prev.details[scenarioId]?.signature,
            [field]: value,
          },
        },
      },
    }));
  }, [setTemplateData]);

  const handleWorkflowsTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setWorkflowsTitle(newTitle);
    onTemplateNameChange({ target: { value: newTitle } });
    setTemplateData((prev) => ({ ...prev, workflow_title: newTitle }));
  }, [onTemplateNameChange, setTemplateData]);

  const handleWorkflowsDescriptionChange = useCallback((e) => {
    const newDescription = e.target.value;
    setWorkflowsDescription(newDescription);
    setTemplateData((prev) => ({ ...prev, desc: newDescription }));
  }, [setTemplateData]);

  const handlePublish = useCallback(() => {
    setIsPublishing(true);
    setError(null);

    const payload = {
      user_email: userEmail,
      template_name: workflowsTitle,
      category: toSnakeCase(selectedCategory),
      scenarios: selectedScenarios,
      details: Object.fromEntries(
        Object.entries(scenariosDetails).map(([scenarioId, details]) => [
          scenarioId,
          {
            ...details,
            tones: {
              selected: details.tones?.selected || null,
            },
            document_type: details.document_type || '',
            context: {
              type: details.context?.type || '',
              content: details.context?.content || '',
              display_type: details.context?.display_type || '',
            },
            signature: {
              greeting: details.signature?.greeting || 'Hi',
              signature: details.signature?.signature || 'Best',
              custom_greeting: details.signature?.customGreeting || '',
              custom_signature: details.signature?.customSignature || '',
            },
            documents: details.documents || [],
            additional_documents: details.additional_documents || [],
          },
        ])
      ),
      workflow_title: workflowsTitle,
      desc: workflowsDescription,
    };

    try {
      localStorage.setItem('template_data', JSON.stringify(payload));
      setCurrentStep(1);
      setSelectedCategory(null);
      setSelectedScenarios([]);
      setScenariosDetails({});
      setWorkflowsTitle('');
      setWorkflowsDescription('');
      setHasScrolled(false);
      setTemplateData({});
      navigate('/pricing');
    } catch (err) {
      setError('Failed to save template data. Please try again or contact support.');
    } finally {
      setIsPublishing(false);
    }
  }, [
    userEmail,
    workflowsTitle,
    selectedCategory,
    selectedScenarios,
    scenariosDetails,
    workflowsDescription,
    setTemplateData,
    navigate,
  ]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && selectedCategory) {
      setDirection('next');
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedScenarios.length > 0) {
      setDirection('next');
      setCurrentStep(3);
    } else if (
      currentStep === 3 &&
      selectedScenarios.every((scenarioId) => scenariosDetails[scenarioId]?.tones?.selected)
    ) {
      setDirection('next');
      setCurrentStep(4);
      setTemplateData((prev) => ({ ...prev, details: scenariosDetails }));
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
          scenariosDetails[scenarioId]?.signature?.greeting &&
          scenariosDetails[scenarioId]?.signature?.signature
      )
    ) {
      setDirection('next');
      setCurrentStep(7);
    } else if (currentStep === 7 && workflowsTitle.trim()) {
      setDirection('next');
      setCurrentStep(8);
    } else if (currentStep === 8) {
      handlePublish();
    } else {
      setError('Please complete the required fields to proceed.');
    }
  }, [
    currentStep,
    selectedCategory,
    selectedScenarios,
    scenariosDetails,
    workflowsTitle,
    handlePublish,
    setTemplateData,
  ]);

  const handleBackStep = useCallback(() => {
    if (currentStep > 1) {
      setDirection('back');
      setCurrentStep(currentStep - 1);
      setError(null);
    } else {
      navigate('/welcome');
    }
  }, [currentStep, navigate]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select email category';
      case 2: return 'Select scenarios';
      case 3: return 'Select tone';
      case 4: return 'Upload documents';
      case 5: return 'Add context';
      case 6: return 'Configure signature';
      case 7: return 'Title and description';
      case 8: return 'Review';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return 'What type of email will your agent reply to?';
      case 2: return 'What type of scenario will you reply to?';
      case 3: return 'Select tone for reply';
      case 4: return 'Attach documents if specific information is needed <span style="color: #9CA3AF">(optional)</span>';
      case 5: return 'Provide additional context <span style="color: #9CA3AF">(optional)</span>';
      case 6: return 'Configure email signature';
      case 7: return 'Title this Agent';
      case 8: return 'Identifying information';
      default: return '';
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
      <div className="welcome-agent-creator-container">
        <header className="welcome-agent-creator-header-top">
          <div className="welcome-agent-creator-header-content">
            <img src={logo} alt="BestWork Logo" className="welcome-agent-creator-header-logo" />
            <h1 className="welcome-agent-creator-header-title fade-in-block fade-in-delay-1">
              Create Agent
            </h1>
          </div>
        </header>

        <main className="welcome-agent-creator-main-content">
          <div className="welcome-agent-creator-selector-container">
            <div className="welcome-agent-creator-left-aligned-container">
              <div className="welcome-agent-creator-header">
                <span className="welcome-agent-creator-header-title-text fade-in-block fade-in-delay-2">
                  {getStepTitle()}
                  <span className="welcome-agent-creator-header-dot"> • </span>
                  Step {currentStep} of 8
                </span>
              </div>
              <div className="welcome-agent-creator-progress-bar fade-in-block fade-in-delay-3">
                <div className="welcome-agent-creator-progress-segments">
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className={`welcome-agent-creator-progress ${
                        index + 1 <= currentStep ? 'success' : ''
                      }`}
                      data-step={index + 1}
                    />
                  ))}
                </div>
              </div>
              <h3
                className={`welcome-agent-creator-step-title fade-in-block fade-in-delay-4 ${
                  currentStep === 3 ? 'step-3-title' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: getStepSubtitle() }}
              />
            </div>

            <div className={`welcome-agent-creator-scrollable-content step-${currentStep}`} ref={scrollableRef}>
              <div className="welcome-agent-creator-centered-content">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="welcome-agent-creator-step-content"
                  >
                    {error && (
                      <div
                        className="welcome-agent-creator-error fade-in-block fade-in-delay-5"
                        style={{ color: 'red', marginBottom: '20px' }}
                      >
                        {error}
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="welcome-agent-creator-grid">
                        {options.map((option) => (
                          <div
                            key={option.id}
                            className={`welcome-agent-creator-card ${
                              selectedCategory === option.name ? 'selected' : ''
                            } fade-in-block fade-in-delay-1`}
                            onClick={() => handleCategorySelect(option.name)}
                          >
                            <div className="welcome-agent-creator-card-content">
                              <img
                                src={
                                  selectedCategory === option.name
                                    ? optionIcons[option.name].blue
                                    : optionIcons[option.name].grey
                                }
                                alt={`${option.name} icon`}
                                className="welcome-agent-creator-icon"
                              />
                              <div className="welcome-agent-creator-email-type">{option.name}</div>
                              <div className="welcome-agent-creator-description">{option.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="welcome-agent-creator-grid">
                        {getScenarios(selectedCategory).map((scenario) => (
                          <div
                            key={scenario.id}
                            className={`welcome-agent-creator-card ${
                              selectedScenarios.includes(scenario.id) ? 'selected' : ''
                            } fade-in-block fade-in-delay-1`}
                            onClick={() => handleScenarioSelect(scenario.id)}
                          >
                            <div className="welcome-agent-creator-card-content">
                              <img
                                src={
                                  selectedScenarios.includes(scenario.id)
                                    ? projectUpdateBlue
                                    : projectUpdateGrey
                                }
                                alt="Scenario email icon"
                                className="welcome-agent-creator-icon"
                              />
                              <div className="welcome-agent-creator-email-type">{scenario.name}</div>
                              <div className="welcome-agent-creator-description">{scenario.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="welcome-agent-creator-grid">
                        {selectedScenarios.map((scenarioId) =>
                          tones.map((tone) => {
                            const details = scenariosDetails[scenarioId] || {};
                            return (
                              <div
                                key={`${scenarioId}-${tone.id}`}
                                className={`welcome-agent-creator-card ${
                                  details.tones?.selected === tone.id ? 'selected' : ''
                                } fade-in-block fade-in-delay-3`}
                                onClick={() => handleToneSelect(scenarioId, tone.id)}
                              >
                                <div className="welcome-agent-creator-card-content">
                                  <img
                                    src={
                                      details.tones?.selected === tone.id
                                        ? toneIcons[tone.id].blue
                                        : toneIcons[tone.id].grey
                                    }
                                    alt={`${tone.name} tone icon`}
                                    className="welcome-agent-creator-icon"
                                  />
                                  <div className="welcome-agent-creator-email-type">{tone.name}</div>
                                  <div className="welcome-agent-creator-description">{tone.description}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="welcome-agent-creator-selected-scenarios-section">
                        <div className="welcome-agent-creator-selected-scenarios-list">
                          {selectedScenarios.map((scenarioId, index) => {
                            const scenario = getScenarios(selectedCategory).find(
                              (s) => s.id === scenarioId
                            );
                            const details = scenariosDetails[scenarioId] || {};
                            const documentOptions =
                              categorySettings[selectedCategory]?.scenarios[scenario?.name]?.documents || [];
                            return (
                              <React.Fragment key={scenarioId}>
                                <div>
                                  <div className="welcome-agent-creator-context-section">
                                    <h4 className="welcome-agent-creator-context-title fade-in-block fade-in-delay-3">
                                      Document type
                                    </h4>
                                    <div className="welcome-agent-creator-dropdown-wrapper fade-in-block fade-in-delay-4">
                                      <select
                                        className="welcome-agent-creator-dropdown"
                                        value={details.document_display_type || ''}
                                        onChange={(e) => handleDocumentTypeChange(scenarioId, e.target.value)}
                                      >
                                        <option value="">Select document type</option>
                                        {documentOptions.map((doc, idx) => (
                                          <option key={idx} value={doc}>
                                            {doc}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {details.document_type && (
                                      <>
                                        <h4 className="welcome-agent-creator-context-title fade-in-block fade-in-delay-5">
                                          Document
                                        </h4>
                                        <div className="welcome-agent-creator-attachment-card fade-in-block fade-in-delay-6">
                                          <label
                                            htmlFor={`file-upload-${scenarioId}`}
                                            className="welcome-agent-creator-attachment-label"
                                          >
                                            <div className="welcome-agent-creator-attachment-info">
                                              <div>Upload document</div>
                                              <div className="welcome-agent-creator-description">
                                                Click to upload file
                                              </div>
                                            </div>
                                          </label>
                                          <input
                                            id={`file-upload-${scenarioId}`}
                                            type="file"
                                            onChange={(e) => handleDocumentUpload(scenarioId, e)}
                                            className="welcome-agent-creator-file-input"
                                            multiple
                                          />
                                        </div>
                                        {(details.documents || []).map((doc, idx) => (
                                          <div
                                            key={idx}
                                            className="welcome-agent-creator-document-card selected fade-in-block fade-in-delay-7"
                                          >
                                            <div className="welcome-agent-creator-document-name">
                                              {decodeURIComponent(doc.name)}
                                            </div>
                                            <div className="welcome-agent-creator-document-size">{doc.size}</div>
                                          </div>
                                        ))}
                                        <button
                                          className="welcome-agent-creator-upload-more-btn fade-in-block fade-in-delay-8"
                                          onClick={() => document.getElementById(`file-upload-${scenarioId}`).click()}
                                        >
                                          Upload more
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {index < selectedScenarios.length - 1 && (
                                  <div className="welcome-agent-creator-section-divider" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="welcome-agent-creator-selected-scenarios-section">
                        <div className="welcome-agent-creator-selected-scenarios-list">
                          {selectedScenarios.map((scenarioId, index) => {
                            const scenario = getScenarios(selectedCategory).find(
                              (s) => s.id === scenarioId
                            );
                            const details = scenariosDetails[scenarioId] || {};
                            const contextOptions =
                              categorySettings[selectedCategory]?.scenarios[scenario?.name]?.additionalContext || [];
                            return (
                              <React.Fragment key={scenarioId}>
                                <div>
                                  <div className="welcome-agent-creator-context-section">
                                    <h4 className="welcome-agent-creator-context-title fade-in-block fade-in-delay-3">
                                      Select context type
                                    </h4>
                                    <div className="welcome-agent-creator-dropdown-wrapper fade-in-block fade-in-delay-4">
                                      <select
                                        className="welcome-agent-creator-dropdown"
                                        value={details.context?.display_type || ''}
                                        onChange={(e) => handleContextChange(scenarioId, 'type', e.target.value)}
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
                                        <h4 className="welcome-agent-creator-context-title fade-in-block fade-in-delay-5">
                                          Context
                                        </h4>
                                        <div className="welcome-agent-creator-input-wrapper fade-in-block fade-in-delay-6">
                                          <textarea
                                            className="welcome-agent-creator-instructions-input"
                                            placeholder="Add context"
                                            value={details.context?.content || ''}
                                            onChange={(e) => handleContextChange(scenarioId, 'content', e.target.value)}
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {index < selectedScenarios.length - 1 && (
                                  <div className="welcome-agent-creator-section-divider" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {currentStep === 6 && (
                      <div className="welcome-agent-creator-selected-scenarios-section">
                        <div className="welcome-agent-creator-selected-scenarios-list">
                          {selectedScenarios.map((scenarioId, index) => {
                            const details = scenariosDetails[scenarioId] || {};
                            return (
                              <React.Fragment key={scenarioId}>
                                <div>
                                  <div className="welcome-agent-creator-context-section">
                                    <h4 className="welcome-agent-creator-context-title fade-in-block fade-in-delay-3">
                                      Select greeting
                                    </h4>
                                    <div className="welcome-agent-creator-dropdown-wrapper fade-in-block fade-in-delay-4">
                                      <select
                                        className="welcome-agent-creator-dropdown"
                                        value={details.signature?.greeting || 'Hi'}
                                        onChange={(e) => handleSignatureChange(scenarioId, 'greeting', e.target.value)}
                                      >
                                        {greetings.map((greeting) => (
                                          <option key={greeting} value={greeting}>
                                            {greeting}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {details.signature?.greeting === 'Custom' && (
                                      <div className="welcome-agent-creator-input-wrapper fade-in-block fade-in-delay-5">
                                        <textarea
                                          className="welcome-agent-creator-instructions-input"
                                          placeholder="Enter custom greeting"
                                          value={details.signature?.customGreeting || ''}
                                          onChange={(e) =>
                                            handleSignatureChange(scenarioId, 'customGreeting', e.target.value)
                                          }
                                        />
                                      </div>
                                    )}
                                    <div className="welcome-agent-creator-divider-label fade-in-block fade-in-delay-6"></div>
                                    <h4 className="welcome-agent-creator-context-title fade-in-block fade-in-delay-7">
                                      Select signature
                                    </h4>
                                    <div className="welcome-agent-creator-dropdown-wrapper fade-in-block fade-in-delay-8">
                                      <select
                                        className="welcome-agent-creator-dropdown"
                                        value={details.signature?.signature || 'Best'}
                                        onChange={(e) => handleSignatureChange(scenarioId, 'signature', e.target.value)}
                                      >
                                        {signatures.map((sig) => (
                                          <option key={sig} value={sig}>
                                            {sig}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {details.signature?.signature === 'Custom' && (
                                      <div className="welcome-agent-creator-input-wrapper fade-in-block fade-in-delay-9">
                                        <textarea
                                          className="welcome-agent-creator-instructions-input"
                                          placeholder="Enter custom signature"
                                          value={details.signature?.customSignature || ''}
                                          onChange={(e) =>
                                            handleSignatureChange(scenarioId, 'customSignature', e.target.value)
                                          }
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {index < selectedScenarios.length - 1 && (
                                  <hr className="welcome-agent-creator-section-divider" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {currentStep === 7 && (
                      <div className="welcome-agent-creator-title-section fade-in-block fade-in-delay-1">
                        <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-2">
                          Title
                        </h3>
                        <div className="welcome-agent-creator-input-wrapper fade-in-block fade-in-delay-3">
                          <input
                            type="text"
                            className="welcome-agent-creator-title-input"
                            placeholder="Enter workflow title"
                            value={workflowsTitle}
                            onChange={handleWorkflowsTitleChange}
                          />
                        </div>
                        <div className="welcome-agent-creator-divider-label fade-in-block fade-in-delay-4"></div>
                        <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-5">
                          Description
                        </h3>
                        <div className="welcome-agent-creator-input-wrapper fade-in-block fade-in-delay-6">
                          <textarea
                            className="welcome-agent-creator-description-input"
                            placeholder="Add a description for your workflow"
                            value={workflowsDescription}
                            onChange={handleWorkflowsDescriptionChange}
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 8 && (
                      <div className="welcome-agent-creator-review-section welcome-agent-creator-left-aligned-review fade-in-block fade-in-delay-1">
                        <div>
                          <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-2">
                            Title
                          </h3>
                          <div className="welcome-agent-creator-input-wrapper fade-in-block fade-in-delay-3">
                            <input
                              type="text"
                              className="welcome-agent-creator-title-input"
                              placeholder="Enter workflow title"
                              value={workflowsTitle}
                              onChange={handleWorkflowsTitleChange}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-4">
                            Description
                          </h3>
                          <div className="welcome-agent-creator-input-wrapper fade-in-block fade-in-delay-5">
                            <textarea
                              className="welcome-agent-creator-description-input"
                              placeholder="Add a description for your workflow"
                              value={workflowsDescription}
                              onChange={handleWorkflowsDescriptionChange}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-6">
                            Email category
                          </h3>
                          <div className="welcome-agent-creator-grid fade-in-block fade-in-delay-7">
                            <div className="welcome-agent-creator-card selected">
                              <div className="welcome-agent-creator-card-content">
                                <img
                                  src={optionIcons[selectedCategory]?.blue}
                                  alt={`${selectedCategory} icon`}
                                  className="welcome-agent-creator-icon"
                                />
                                <div className="welcome-agent-creator-email-type">
                                  {selectedCategory || 'Not selected'}
                                </div>
                                <div className="welcome-agent-creator-description">
                                  {selectedCategory === 'Client communications'
                                    ? 'Project or account-related emails covering deliverables, feedback, change requests, etc.'
                                    : selectedCategory === 'Cold inbound'
                                    ? 'Senders proposing services, partnerships, investment, or requests to connect for networking'
                                    : '...'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-8">
                            Scenarios
                          </h3>
                          <div className="welcome-agent-creator-grid fade-in-block fade-in-delay-9">
                            {selectedScenarios.map((scenarioId) => {
                              const scenario = getScenarios(selectedCategory).find(
                                (s) => s.id === scenarioId
                              );
                              return (
                                <div
                                  key={scenarioId}
                                  className="welcome-agent-creator-card selected"
                                >
                                  <div className="welcome-agent-creator-card-content">
                                    <img
                                      src={projectUpdateBlue}
                                      alt="Scenario email icon"
                                      className="welcome-agent-creator-icon"
                                    />
                                    <div className="welcome-agent-creator-email-type">
                                      {scenario?.name || 'Unknown Scenario'}
                                    </div>
                                    <div className="welcome-agent-creator-description">
                                      {scenario?.description || 'No description available'}
                                    </div>
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
                          const details = scenariosDetails[scenarioId] || {};
                          const documentOptions =
                            categorySettings[selectedCategory]?.scenarios[scenario?.name]?.documents || [];
                          const contextOptions =
                            categorySettings[selectedCategory]?.scenarios[scenario?.name]?.additionalContext || [];
                          return (
                            <React.Fragment key={scenarioId}>
                              <div>
                                <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-10">
                                  Tone
                                </h3>
                                <div className="welcome-agent-creator-grid fade-in-block fade-in-delay-11">
                                  {(() => {
                                    const selectedTone = tones.find(
                                      (tone) => tone.id === details.tones?.selected
                                    );
                                    if (!selectedTone) {
                                      return (
                                        <div className="welcome-agent-creator-card">
                                          <div className="welcome-agent-creator-card-content">
                                            <div className="welcome-agent-creator-email-type">No tone selected</div>
                                            <div className="welcome-agent-creator-description">
                                              Please select a tone for this scenario.
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div
                                        className="welcome-agent-creator-card selected"
                                        onClick={() => handleToneSelect(scenarioId, selectedTone.id)}
                                      >
                                        <div className="welcome-agent-creator-card-content">
                                          <img
                                            src={toneIcons[selectedTone.id].blue}
                                            alt={`${selectedTone.name} tone icon`}
                                            className="welcome-agent-creator-icon"
                                          />
                                          <div className="welcome-agent-creator-email-type">{selectedTone.name}</div>
                                          <div className="welcome-agent-creator-description">
                                            {selectedTone.description}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div>
                                <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-12">
                                  Documents
                                </h3>
                                <div className="welcome-agent-creator-grid fade-in-block fade-in-delay-13">
                                  <div className="welcome-agent-creator-card">
                                    <div className="welcome-agent-creator-dropdown-wrapper">
                                      <select
                                        className="welcome-agent-creator-dropdown"
                                        value={details.document_display_type || ''}
                                        onChange={(e) => handleDocumentTypeChange(scenarioId, e.target.value)}
                                      >
                                        <option value="">Select document type</option>
                                        {documentOptions.map((doc, idx) => (
                                          <option key={idx} value={doc}>
                                            {doc}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {details.document_type && (
                                      <div className="welcome-agent-creator-attachment-card">
                                        <label
                                          htmlFor={`file-upload-review-${scenarioId}`}
                                          className="welcome-agent-creator-attachment-label"
                                        >
                                          <div className="welcome-agent-creator-attachment-info">
                                            <div>Upload document</div>
                                            <div className="welcome-agent-creator-description">
                                              Click to upload file
                                            </div>
                                          </div>
                                        </label>
                                        <input
                                          id={`file-upload-review-${scenarioId}`}
                                          type="file"
                                          onChange={(e) => handleDocumentUpload(scenarioId, e)}
                                          className="welcome-agent-creator-file-input"
                                          multiple
                                        />
                                      </div>
                                    )}
                                    {(details.documents || []).map((doc, idx) => (
                                      <div
                                        key={idx}
                                        className="welcome-agent-creator-document-card selected"
                                      >
                                        <div className="welcome-agent-creator-document-name">
                                          {decodeURIComponent(doc.name)}
                                        </div>
                                        <div className="welcome-agent-creator-document-size">{doc.size}</div>
                                      </div>
                                    ))}
                                    <div className="welcome-agent-creator-attachment-card">
                                      <label
                                        htmlFor={`additional-file-upload-review-${scenarioId}`}
                                        className="welcome-agent-creator-attachment-label"
                                      >
                                        <div className="welcome-agent-creator-attachment-info">
                                          <div>Upload additional document</div>
                                          <div className="welcome-agent-creator-description">
                                            Click to upload additional file
                                          </div>
                                        </div>
                                      </label>
                                      <input
                                        id={`additional-file-upload-review-${scenarioId}`}
                                        type="file"
                                        onChange={(e) => handleDocumentUpload(scenarioId, e, true)}
                                        className="welcome-agent-creator-file-input"
                                        multiple
                                      />
                                    </div>
                                    {(details.additional_documents || []).map((doc, idx) => (
                                      <div
                                        key={idx}
                                        className="welcome-agent-creator-document-card selected"
                                      >
                                        <div className="welcome-agent-creator-document-name">
                                          {decodeURIComponent(doc.name)}
                                        </div>
                                        <div className="welcome-agent-creator-document-size">{doc.size}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-14">
                                  Context
                                </h3>
                                <div className="welcome-agent-creator-grid fade-in-block fade-in-delay-15">
                                  <div className="welcome-agent-creator-card">
                                    <div className="welcome-agent-creator-dropdown-wrapper">
                                      <select
                                        className="welcome-agent-creator-dropdown"
                                        value={details.context?.display_type || ''}
                                        onChange={(e) => handleContextChange(scenarioId, 'type', e.target.value)}
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
                                      <div className="welcome-agent-creator-input-wrapper">
                                        <textarea
                                          className="welcome-agent-creator-instructions-input"
                                          placeholder="Add additional context"
                                          value={details.context?.content || ''}
                                          onChange={(e) => handleContextChange(scenarioId, 'content', e.target.value)}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h3 className="welcome-agent-creator-review-title fade-in-block fade-in-delay-16">
                                  Salutation
                                </h3>
                                <div className="welcome-agent-creator-grid fade-in-block fade-in-delay-17">
                                  <div className="welcome-agent-creator-card">
                                    <div className="welcome-agent-creator-email-type">Greeting</div>
                                    <div className="welcome-agent-creator-dropdown-wrapper">
                                      <select
                                        className="welcome-agent-creator-dropdown"
                                        value={details.signature?.greeting || 'Hi'}
                                        onChange={(e) => handleSignatureChange(scenarioId, 'greeting', e.target.value)}
                                      >
                                        {greetings.map((greeting) => (
                                          <option key={greeting} value={greeting}>
                                            {greeting}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {details.signature?.greeting === 'Custom' && (
                                      <div className="welcome-agent-creator-input-wrapper">
                                        <textarea
                                          className="welcome-agent-creator-instructions-input"
                                          placeholder="Enter custom greeting"
                                          value={details.signature?.customGreeting || ''}
                                          onChange={(e) =>
                                            handleSignatureChange(scenarioId, 'customGreeting', e.target.value)
                                          }
                                        />
                                      </div>
                                    )}
                                    <div className="welcome-agent-creator-email-type">Signature</div>
                                    <div className="welcome-agent-creator-dropdown-wrapper">
                                      <select
                                        className="welcome-agent-creator-dropdown"
                                        value={details.signature?.signature || 'Best'}
                                        onChange={(e) => handleSignatureChange(scenarioId, 'signature', e.target.value)}
                                      >
                                        {signatures.map((sig) => (
                                          <option key={sig} value={sig}>
                                            {sig}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {details.signature?.signature === 'Custom' && (
                                      <div className="welcome-agent-creator-input-wrapper">
                                        <textarea
                                          className="welcome-agent-creator-instructions-input"
                                          placeholder="Enter custom signature"
                                          value={details.signature?.customSignature || ''}
                                          onChange={(e) =>
                                            handleSignatureChange(scenarioId, 'customSignature', e.target.value)
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
              <div className="welcome-agent-creator-footer-container fade-in-block fade-in-delay-5">
                <div className="welcome-agent-creator-footer-text">
                  Replies are written to the drafts of your linked account.
                </div>
                <div className="welcome-agent-creator-navigation">
                  <button
                    className="welcome-agent-creator-back-btn"
                    onClick={handleBackStep}
                    disabled={currentStep === 1}
                  >
                    Back
                  </button>
                  <button
                    className="welcome-agent-creator-next-btn"
                    onClick={currentStep === 8 ? handlePublish : handleNextStep}
                    disabled={
                      (currentStep === 1 && !selectedCategory) ||
                      (currentStep === 2 && selectedScenarios.length === 0) ||
                      (currentStep === 3 &&
                        !selectedScenarios.every(
                          (scenarioId) => scenariosDetails[scenarioId]?.tones?.selected
                        )) ||
                      (currentStep === 6 &&
                        !selectedScenarios.every(
                          (scenarioId) =>
                            scenariosDetails[scenarioId]?.signature?.greeting &&
                            scenariosDetails[scenarioId]?.signature?.signature
                        )) ||
                      (currentStep === 7 && !workflowsTitle.trim()) ||
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
        </main>
      </div>
    </ErrorBoundary>
  );
};

WelcomeAgentCreator.propTypes = {
  userEmail: PropTypes.string,
  templateName: PropTypes.string,
  onTemplateNameChange: PropTypes.func.isRequired,
  templateData: PropTypes.object,
  setTemplateData: PropTypes.func.isRequired,
};

WelcomeAgentCreator.defaultProps = {
  userEmail: '',
  templateName: '',
  templateData: {},
};

export default WelcomeAgentCreator;