import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './dashboard.css';
import './CreateTemplate.css';
import Sidebar from './Sidebar';

// Define category mapping with explicit mapping for Complaint/Issue Report
const categoryMapping = {
  Announcement: 'Other',
  Scheduling: 'Schedule Meeting',
  Negotiation: 'Other',
  'Status report': 'Other',
  'Sales pitch': 'Cold Sales',
  Networking: 'Other',
  'Task assignment': 'Other',
  'Information Request': 'Information Request',
  'Follow-up': 'Other',
  'Feedback Request': 'Other',
  'Complaint/Issue Report': 'complaint-issue-report',
  Personal: 'Other',
  'Event Invitation': 'Other',
  Other: 'Other',
};

const CreateTemplate = ({ userEmail, handleBack, templateName, onTemplateNameChange, templateData, setTemplateData, isPublishing, setIsPublishing }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Automations');
  const [showFillMenu, setShowFillMenu] = useState(false);
  const [showSignatureMenu, setShowSignatureMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [fillMenuIndex, setFillMenuIndex] = useState(null);
  const [signatureMenuIndex, setSignatureMenuIndex] = useState(null);
  const [linkMenuIndex, setLinkMenuIndex] = useState(null);
  const [selectedTone, setSelectedTone] = useState(templateData?.tone || 'Professional');
  const [responseLength, setResponseLength] = useState(templateData?.length || 50);
  const [customRequirements, setCustomRequirements] = useState(templateData?.customRequirements || '');
  const [customResponseStyle, setCustomResponseStyle] = useState(templateData?.customResponseStyle || '');

  const initialTemplateData = {
    tone: 'Professional',
    length: 50,
    emailExamples: [{ id: Date.now().toString(), text: '' }],
    type: 'announcement',
    customResponseStyle: '',
    customRequirements: '',
    name: templateName || '',
  };

  const getInitialCategory = (type) => {
    if (type === 'complaint-issue-report') return 'Complaint/Issue Report';
    const entry = Object.entries(categoryMapping).find(
      ([, value]) => value.toLowerCase().replace(/\s+/g, '-') === type
    );
    return entry ? entry[0] : 'Announcement';
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory(templateData?.type || initialTemplateData.type));
  const [emailExampleWordCounts, setEmailExampleWordCounts] = useState(
    (templateData?.emailExamples || initialTemplateData.emailExamples).map((example) =>
      example.text.trim().split(/\s+/).filter((word) => word.length > 0).length
    )
  );

  const fillButtonRef = useRef(null);
  const signatureButtonRef = useRef(null);
  const linkButtonRef = useRef(null);
  const sliderRef = useRef(null);

  // Initialize templateData if not set
  useEffect(() => {
    if (!templateData && typeof setTemplateData === 'function') {
      console.log('CreateTemplate: Initializing templateData');
      setTemplateData({
        ...initialTemplateData,
        name: templateName,
      });
    }
  }, [templateData, setTemplateData, templateName]);

  // Listen for custom publish event
  useEffect(() => {
    const triggerPublish = () => {
      console.log('CreateTemplate: Received triggerPublish event');
      handlePublish();
    };
    document.addEventListener('triggerPublish', triggerPublish);
    return () => document.removeEventListener('triggerPublish', triggerPublish);
  }, [templateData, templateName, userEmail]);

  const handleToneChange = (e) => {
    const tone = e.target.value;
    setSelectedTone(tone);
    if (typeof setTemplateData === 'function') {
      setTemplateData((prev) => ({
        ...prev,
        tone,
      }));
    }
  };

  const handleLengthChange = (e) => {
    const length = parseInt(e.target.value);
    setResponseLength(length);
    if (typeof setTemplateData === 'function') {
      setTemplateData((prev) => ({
        ...prev,
        length,
      }));
    }
    e.target.style.setProperty('--value', `${length}%`);
    if (length === 50) {
      e.target.classList.remove('fill-left', 'fill-right');
      e.target.classList.add('fill-center');
    } else if (length < 50) {
      e.target.classList.remove('fill-right', 'fill-center');
      e.target.classList.add('fill-left');
    } else {
      e.target.classList.remove('fill-left', 'fill-center');
      e.target.classList.add('fill-right');
    }
  };

  const handleEmailExampleChange = (id, value) => {
    if (typeof setTemplateData === 'function') {
      setTemplateData((prev) => {
        const updatedExamples = prev.emailExamples.map((example) =>
          example.id === id ? { ...example, text: value } : example
        );
        return { ...prev, emailExamples: updatedExamples };
      });
    }
    const wordCount = value.trim().split(/\s+/).filter((word) => word.length > 0).length;
    setEmailExampleWordCounts((prev) => {
      const index = (templateData?.emailExamples || initialTemplateData.emailExamples).findIndex((example) => example.id === id);
      const newCounts = [...prev];
      newCounts[index] = wordCount;
      return newCounts;
    });
  };

  const handleAddEmailExample = () => {
    const newId = Date.now().toString();
    if (typeof setTemplateData === 'function') {
      setTemplateData((prev) => ({
        ...prev,
        emailExamples: [...prev.emailExamples, { id: newId, text: '' }],
      }));
    }
    setEmailExampleWordCounts((prev) => [...prev, 0]);
  };

  const handleDeleteEmailExample = (id) => {
    if (typeof setTemplateData === 'function') {
      setTemplateData((prev) => ({
        ...prev,
        emailExamples: prev.emailExamples.filter((example) => example.id !== id),
      }));
    }
    setEmailExampleWordCounts((prev) => {
      const index = (templateData?.emailExamples || initialTemplateData.emailExamples).findIndex((example) => example.id === id);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCustomResponseStyleChange = (e) => {
    const value = e.target.value;
    setCustomResponseStyle(value);
    if (typeof setTemplateData === 'function') {
      setTemplateData((prev) => ({
        ...prev,
        customResponseStyle: value,
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    const typeValue = categoryMapping[category] === 'Other'
      ? category.toLowerCase().replace(/\s+/g, '-')
      : categoryMapping[category];
    if (typeof setTemplateData === 'function') {
      setTemplateData((prev) => ({
        ...prev,
        type: typeValue,
      }));
    }
  };

  const handlePublish = async () => {
    console.log('CreateTemplate: handlePublish called');
    if (!templateData) {
      alert('No template data to publish.');
      console.error('CreateTemplate: Template data is null');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to publish this template?');
    if (!confirmed) {
      console.log('CreateTemplate: Publish cancelled by user');
      return;
    }

    setIsPublishing(true);
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      const payload = {
        email: userEmail,
        name: templateName || 'Untitled template',
        tone: templateData.tone || 'Professional',
        length: templateData.length || 50,
        emailExamples: (templateData.emailExamples || []).map((example) => example.text || ''),
        type: templateData.type || 'announcement',
        customRequirements: templateData.customRequirements || '',
        customResponseStyle: templateData.customResponseStyle || '',
        id: templateData.id || Date.now().toString(),
      };

      console.log('CreateTemplate: Sending API request to publish:', { payload });

      const response = await fetch(
        'https://2ofjdl14kg.execute-api.us-east-1.amazonaws.com/prod/publish',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('CreateTemplate: API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('CreateTemplate: API error response:', errorData);
        throw new Error(errorData.error || 'Failed to publish template');
      }

      const result = await response.json();
      console.log('CreateTemplate: Template published successfully:', result);

      const cachedData = JSON.parse(localStorage.getItem('userDataCache') || '{}');
      const newTemplate = {
        ...templateData,
        name: templateName,
        id: result.templateId || Date.now().toString(),
        category: result.category || 'Uncategorized',
        lastUpdated: Date.now(),
      };
      localStorage.setItem(
        'userDataCache',
        JSON.stringify({
          ...cachedData,
          templates: [...(cachedData.templates || []), newTemplate],
          lastFetched: Date.now(),
        })
      );

      navigate('/dashboard', {
        state: { newTemplate },
      });
    } catch (error) {
      console.error('CreateTemplate: Error publishing template:', error.message, error.stack);
      alert(`Failed to publish template: ${error.message}. Please try again.`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpgradeToPro = () => {
    console.log('CreateTemplate: Upgrade toPro button clicked');
    window.location.href = 'https://buy.stripe.com/6oUeVe72f0ZCaV23Vc8Ra0k';
  };

  const handleFillMenuItemClick = (option, index, type) => {
    console.log(`CreateTemplate: Fill menu option clicked: ${option} for ${type} ${index}`);
    if (type === 'emailExample') {
      setShowFillMenu(false);
      setFillMenuIndex(null);
    }
  };

  const handleSignatureMenuItemClick = (option, index, type) => {
    console.log(`CreateTemplate: Signature menu option clicked: ${option} for ${type} ${index}`);
    if (type === 'emailExample') {
      setShowSignatureMenu(false);
      setSignatureMenuIndex(null);
    }
  };

  const handleLinkMenuItemClick = (option, index, type) => {
    console.log(`CreateTemplate: Link menu option clicked: ${option} for ${type} ${index}`);
    if (type === 'emailExample') {
      setShowLinkMenu(false);
      setLinkMenuIndex(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fillButtonRef.current && !fillButtonRef.current.contains(event.target)) {
        setShowFillMenu(false);
        setFillMenuIndex(null);
      }
      if (signatureButtonRef.current && !signatureButtonRef.current.contains(event.target)) {
        setShowSignatureMenu(false);
        setSignatureMenuIndex(null);
      }
      if (linkButtonRef.current && !linkButtonRef.current.contains(event.target)) {
        setShowLinkMenu(false);
        setLinkMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--value', `${responseLength}%`);
      sliderRef.current.classList.add('fill-center');
    }
  }, [responseLength]);

  // Fallback if templateData is not set
  if (!templateData) {
    return (
      <div className="loading-overlay">
        <div className="loader"></div>
        <p className="loading-text">Initializing template...</p>
      </div>
    );
  }

  return (
    <div className="create-template-grid">
      <div className="create-template-column">
        <div className="create-template-block create-template-email-type-block">
          <div className="create-template-block-header">
            <h3>Email type</h3>
            <div className="info-tooltip">
              <span className="info-icon">i</span>
              <span className="tooltip-text">Select the type of email to categorize and add any custom requirements.</span>
            </div>
          </div>
          <div className="create-email-type-content">
            <div className="create-email-type-category-section">
              <div className="create-email-type-label-container">
                <label className="create-email-type-label">Type of email replied to</label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="create-email-type-dropdown"
                  aria-label="Select email category"
                >
                  {Object.keys(categoryMapping).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="create-email-type-custom-section">
              <label className="create-email-type-custom-label">Custom requirements (optional)</label>
              <textarea
                value={customRequirements}
                onChange={(e) => {
                  setCustomRequirements(e.target.value);
                  if (typeof setTemplateData === 'function') {
                    setTemplateData((prev) => ({ ...prev, customRequirements: e.target.value }));
                  }
                }}
                placeholder="Detail how you want this type of email to be categorized"
                rows="6"
                className="create-template-email-type-custom"
              />
            </div>
          </div>
        </div>
        <div className="create-template-block create-response-style-block">
          <div className="create-template-block-header">
            <h3>Personalize your response</h3>
            <div className="info-tooltip">
              <span className="info-icon">i</span>
              <span className="tooltip-text">Set the tone, length, and additional style preferences for how these emails should be written.</span>
            </div>
          </div>
          <div className="create-response-style-content">
            <div className="create-tone-section">
              <div className="create-tone-label-container">
                <label className="create-tone-label">Tone</label>
                <select
                  value={selectedTone}
                  onChange={handleToneChange}
                  className="create-tone-dropdown"
                  aria-label="Select tone"
                >
                  {[
                    'Professional',
                    'Friendly',
                    'Grateful',
                    'Confident',
                    'Urgent',
                    'Apologetic',
                    'Collaborative',
                  ].map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="create-length-section">
              <div className="create-length-label-container">
                <label className="create-length-label">Length</label>
                <div className="create-length-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={responseLength}
                    onChange={handleLengthChange}
                    onInput={handleLengthChange}
                    className="create-length-slider fill-center"
                    style={{ '--value': `${responseLength}%` }}
                    aria-label="Response length"
                    aria-valuetext={`${responseLength}%`}
                    ref={sliderRef}
                  />
                  <div className="create-length-labels-below">
                    <span className="create-length-label-side">Shorter</span>
                    <span className="create-length-label-side">Longer</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="create-response-style-custom-section">
              <label className="create-response-style-label">Custom style preferences (optional)</label>
              <textarea
                value={customResponseStyle}
                onChange={handleCustomResponseStyleChange}
                placeholder="Add any specific style preferences (e.g., use bullet points, avoid jargon)"
                rows="4"
                className="create-template-response-style-custom"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="create-template-column">
        <div className="create-template-block create-template-email-examples-block">
          <div className="create-template-block-header">
            <h3>Input example replies</h3>
            <div className="info-tooltip">
              <span className="info-icon">i</span>
              <span className="tooltip-text">The example emails train your AI agent to write email responses the way you want.</span>
            </div>
          </div>
          <div className="create-email-examples-content">
            <TransitionGroup component="div" className="create-email-examples-container">
              {(templateData.emailExamples || []).map((example, index) => (
                <CSSTransition key={example.id} timeout={500} classNames="create-email-example">
                  <div className="create-email-example-container">
                    <div className="create-email-example-textarea-container">
                      <textarea
                        value={example.text}
                        onChange={(e) => handleEmailExampleChange(example.id, e.target.value)}
                        placeholder={`Subject:\nInput example of an email that would trigger the response`}
                        rows="8"
                        className="create-template-email-example"
                      />
                      <div className="create-email-example-footer">
                        <div className="create-email-example-buttons">
                          <div className="create-fill-button-container" ref={fillButtonRef}>
                            <button
                              className="create-email-action-button"
                              onClick={() => {
                                setShowFillMenu(true);
                                setFillMenuIndex(index);
                              }}
                              aria-label="Open fill options menu"
                            >
                              <img
                                src="/assets/fill_icon_example_email.png"
                                alt="Fill"
                                className="create-email-action-icon"
                              />
                            </button>
                            {showFillMenu && fillMenuIndex === index && (
                              <div className="create-fill-menu">
                                {[
                                  'Conversation subject (coming soon)',
                                  'Recipient full name (coming soon)',
                                  'Recipient first name (coming soon)',
                                  'Recipient last name (coming soon)',
                                  'AI fill (coming soon)',
                                  'BestWork sign-off (coming soon)',
                                  'Personal sign-off (coming soon)',
                                  'Link text (coming soon)',
                                  'Hiring process (coming soon)',
                                  'Link URL (coming soon)',
                                  'https://bestwork.ai/hiring (coming soon)',
                                ].map((option) => (
                                  <button
                                    key={option}
                                    className="create-fill-menu-item"
                                    onClick={() => handleFillMenuItemClick(option, index, 'emailExample')}
                                    disabled={option.includes('(coming soon)')}
                                    aria-label={`Insert ${option} into email example`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="create-signature-button-container" ref={signatureButtonRef}>
                            <button
                              className="create-email-action-button"
                              onClick={() => {
                                setShowSignatureMenu(true);
                                setSignatureMenuIndex(index);
                              }}
                              aria-label="Open signature options menu"
                            >
                              <img
                                src="/assets/signature_icon_example_email.png"
                                alt="Signature"
                                className="create-email-action-icon"
                              />
                            </button>
                            {showSignatureMenu && signatureMenuIndex === index && (
                              <div className="create-signature-menu">
                                {['BestWork sign-off (coming soon)', 'Personal sign-off (coming soon)'].map((option) => (
                                  <button
                                    key={option}
                                    className="create-signature-menu-item"
                                    onClick={() => handleSignatureMenuItemClick(option, index, 'emailExample')}
                                    disabled={option.includes('(coming soon)')}
                                    aria-label={`Insert ${option} into email example`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="create-link-button-container" ref={linkButtonRef}>
                            <button
                              className="create-email-action-button"
                              onClick={() => {
                                setShowLinkMenu(true);
                                setLinkMenuIndex(index);
                              }}
                              aria-label="Open link options menu"
                            >
                              <img
                                src="/assets/link_icon_example_email.png"
                                alt="Link"
                                className="create-email-action-icon"
                              />
                            </button>
                            {showLinkMenu && linkMenuIndex === index && (
                              <div className="create-link-menu">
                                {['Link text (coming soon)', 'Hiring process (coming soon)', 'Link URL (coming soon)', 'https://bestwork.ai/hiring (coming soon)'].map(
                                  (option) => (
                                    <button
                                      key={option}
                                      className="create-link-menu-item"
                                      onClick={() => handleLinkMenuItemClick(option, index, 'emailExample')}
                                      disabled={option.includes('(coming soon)')}
                                      aria-label={`Insert ${option} into email example`}
                                    >
                                      {option}
                                    </button>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="create-email-word-count">
                          {emailExampleWordCounts[index] || 0}{' '}
                          {emailExampleWordCounts[index] === 1 ? 'word' : 'words'}
                        </span>
                      </div>
                    </div>
                    {index > 0 && (
                      <div className="create-email-example-delete-wrapper">
                        <button
                          className="create-delete-example-button"
                          onClick={() => handleDeleteEmailExample(example.id)}
                          title="Delete this example"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </CSSTransition>
              ))}
            </TransitionGroup>
            <button className="create-add-example-button" onClick={handleAddEmailExample}>
              <span className="create-plus-symbol">+</span> Add Additional Example
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplate;