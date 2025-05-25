import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import './TemplateOverview.css';
import HubspotIcon from '/assets/gmail-logo.png';
import DriftIcon from '/assets/blue_icon.jpeg';
import SlackIcon from '/assets/gmail-logo.png';
import noTemplatesImage from '/assets/my_workflow_no_automations.png';

const TemplateOverview = ({ templates = [], activeTab, setActiveTab, firstName, lastName, setUserData }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [localTemplates, setLocalTemplates] = useState(Array.isArray(templates) ? templates : []);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const newTemplate = useMemo(() => location.state?.newTemplate, [location.state]);

  console.log('TemplateOverview: Rendering with props:', {
    activeTab,
    templates,
    firstName,
    lastName,
    localTemplates,
  });

  useEffect(() => {
    const updatedTemplates = Array.isArray(templates) ? [...templates] : [];
    if (newTemplate && !updatedTemplates.some((t) => t.id === newTemplate.id)) {
      updatedTemplates.push(newTemplate);
    }
    if (JSON.stringify(updatedTemplates) !== JSON.stringify(localTemplates)) {
      setLocalTemplates(updatedTemplates);
      console.log('TemplateOverview: Updated localTemplates:', updatedTemplates);
    }
  }, [templates, newTemplate, localTemplates]);

  const handleTemplateClick = (template) => {
    setSelectedTemplateId(selectedTemplateId === template.id ? null : template.id);
    navigate('/dashboard/create-template', { state: { template } });
  };

  const handleDotsClick = (e, templateId) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === templateId ? null : templateId);
  };

  const handleDeleteClick = async (e, templateId) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this template?');
    if (!confirmed) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const email = session.getIdToken().payload.email;

      const response = await fetch(
        'https://2ofjdl14kg.execute-api.us-east-1.amazonaws.com/prod/delete-template',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email,
            templateId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }

      console.log('Template deleted:', templateId);
      const updatedTemplates = localTemplates.filter((template) => template.id !== templateId);
      setLocalTemplates(updatedTemplates);
      setDropdownOpen(null);

      setUserData((prev) => ({
        ...prev,
        templates: updatedTemplates,
        lastFetched: Date.now(),
      }));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="template-overview-container">
      <div className="template-overview-header">
        <h2>My Templates</h2>
      </div>
      {localTemplates.length === 0 ? (
        <div className="no-templates">
          <img
            src={noTemplatesImage}
            alt="No templates available"
            className="no-templates-image"
          />
          <div className="no-templates-text">
            <h3 className="no-templates-title">A place for all your templates</h3>
            <p className="no-templates-subtext">
              Click “Create new” to build your first template
            </p>
          </div>
        </div>
      ) : (
        <div className="template-overview-grid">
          {localTemplates.map((template) => (
            <div
              key={template.id}
              className={`template-overview-card ${
                selectedTemplateId === template.id ? 'template-overview-selected' : ''
              }`}
              onClick={() => handleTemplateClick(template)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleTemplateClick(template)}
            >
              <div className="template-overview-icon-flow">
                <div className="template-overview-icon-item">
                  <img src={HubspotIcon} alt="Gmail Input" className="template-overview-icon" />
                  <span className="template-overview-icon-label">Gmail Input</span>
                </div>
                <div className="template-overview-icon-item">
                  <img src={DriftIcon} alt="BestWork" className="template-overview-icon" />
                  <span className="template-overview-icon-label">BestWork</span>
                </div>
                <div className="template-overview-icon-item">
                  <img src={SlackIcon} alt="Gmail Output" className="template-overview-icon" />
                  <span className="template-overview-icon-label">Gmail Output</span>
                </div>
              </div>
              <div className="template-overview-info">
                <div className="template-overview-title-row">
                  <h3 className="template-overview-title">{template.name || 'Untitled template'}</h3>
                  <div className="template-overview-dots-container" ref={dropdownRef}>
                    <span
                      className="template-overview-dots"
                      onClick={(e) => handleDotsClick(e, template.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleDotsClick(e, template.id)}
                    >
                      ...
                    </span>
                    {dropdownOpen === template.id && (
                      <div className="template-overview-dropdown">
                        <button
                          className="template-overview-dropdown-item"
                          onClick={(e) => handleDeleteClick(e, template.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="template-overview-description">
                  {template.systemPrompt
                    ? template.systemPrompt.substring(0, 100) + '...'
                    : 'No description available.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateOverview;