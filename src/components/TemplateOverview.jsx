import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import './TemplateOverview.css';
import categoryEmailBlue from '/assets/template_overview.png';
import categoryEmailGrey from '/assets/template_overview.png';

const TemplateOverview = ({ templates = [], activeTab, setActiveTab, firstName, lastName, setUserData, handleTemplateOverviewCreateNewCurrent }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [localTemplates, setLocalTemplates] = useState(Array.isArray(templates) ? templates : []);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null); // Track deleting template
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const newTemplate = useMemo(() => location.state?.newTemplate, [location.state]);

  useEffect(() => {
    console.log('TemplateOverview: Received templates prop:', templates);
    const updatedTemplates = Array.isArray(templates) ? [...templates] : [];
    if (newTemplate && !updatedTemplates.some((t) => t.id === newTemplate.id)) {
      updatedTemplates.push(newTemplate);
    }
    if (JSON.stringify(updatedTemplates) !== JSON.stringify(localTemplates)) {
      console.log('TemplateOverview: Updating localTemplates:', updatedTemplates);
      setLocalTemplates(updatedTemplates);
    }
  }, [templates, newTemplate, localTemplates]);

  const handleTemplateClick = (template) => {
    const baseTemplateId = template.id.split('#')[0]; // Use only the base UUID
    setSelectedTemplateId(selectedTemplateId === template.id ? null : template.id);
    navigate(`/dashboard/edit-template/${baseTemplateId}`, { state: { template } });
  };

  const handleDotsClick = (e, templateId) => {
    e.stopPropagation();
    console.log('Dots clicked for template:', templateId, 'Current dropdownOpen:', dropdownOpen);
    setDropdownOpen(dropdownOpen === templateId ? null : templateId);
  };

  const handleDeleteClick = async (e, templateId) => {
    e.stopPropagation();
    console.log('Delete button clicked for template:', templateId);

    const confirmed = window.confirm('Are you sure you want to delete this template?');
    if (!confirmed) {
      console.log('Deletion cancelled by user');
      return;
    }

    setDeletingTemplateId(templateId); // Set deleting state
    setDropdownOpen(null);
    console.log('Setting deleting state for template:', templateId);

    try {
      console.log('Fetching current session...');
      let session;
      try {
        session = await Auth.currentSession();
      } catch (authError) {
        console.error('Auth session error:', authError);
        throw new Error('Authentication failed. Please log in again.');
      }

      const idToken = session.getIdToken().getJwtToken();
      const email = session.getIdToken().payload.email;
      console.log('Session retrieved. Email:', email, 'TemplateId:', templateId);

      console.log('Sending delete request to API...');
      const response = await fetch(
        'https://2ofjdl14kg.execute-api.us-east-1.amazonaws.com/prod/delete-template',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ email, templateId }),
        }
      );

      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to delete template');
      }

      console.log('Delete request successful. Waiting for animation...');
      // Update local state and parent state
      const updatedTemplates = localTemplates.filter((template) => template.id !== templateId);
      setLocalTemplates(updatedTemplates);
      setDeletingTemplateId(null);
      console.log('Template removed from state:', templateId);

      // Update parent state and cache
      setUserData((prev) => {
        const newUserData = {
          ...prev,
          templates: updatedTemplates,
          lastFetched: Date.now(),
        };
        console.log('TemplateOverview: Updating userData:', newUserData);
        // Directly update localStorage to ensure cache consistency
        localStorage.setItem('userDataCache', JSON.stringify(newUserData));
        return newUserData;
      });
    } catch (error) {
      console.error('Error in handleDeleteClick:', error.message);
      setDeletingTemplateId(null);
      alert(`Failed to delete template: ${error.message}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/dashboard/template-creator');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('Click outside, closing dropdown. Current dropdownOpen:', dropdownOpen);
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="template-overview-container">
      <div className="template-overview-header">
        <h2>My Agents</h2>
      </div>
      <div className="template-overview-content">
        {localTemplates.length === 0 ? (
          <div className="template-overview-no-templates">
            <button
              className="template-overview-no-templates-create-new-button"
              onClick={handleCreateNew}
              aria-label="Create new template"
            >
              <span className="template-overview-plus-create-new">+</span>Create New
            </button>
            <div className="template-overview-no-templates-text">
              <p className="template-overview-no-templates-subtext">
                Click “Create new” to build your first workflow
              </p>
            </div>
          </div>
        ) : (
          <div className="template-overview-grid">
            {localTemplates.map((template) => (
              <div
                key={template.id}
                className={`template-overview-card ${
                  selectedTemplateId === template.id ? 'selected' : ''
                } ${deletingTemplateId === template.id ? 'deleting' : ''}`}
                onClick={() => handleTemplateClick(template)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTemplateClick(template)}
              >
                {deletingTemplateId === template.id ? (
                  <div className="template-overview-deleting-overlay">
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={selectedTemplateId === template.id ? categoryEmailBlue : categoryEmailGrey}
                      alt="Template icon"
                      className="template-overview-icon"
                    />
                    <div className="template-overview-email-type">
                      {template.title || 'Untitled agent'}
                    </div>
                    <div className="template-overview-description">
                      {template.description
                        ? template.description.substring(0, 100) + (template.description.length > 100 ? '...' : '')
                        : 'No description provided.'}
                    </div>
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
                          {console.log('Rendering dropdown for template:', template.id, 'dropdownOpen:', dropdownOpen)}
                          <button
                            className="template-overview-dropdown-item"
                            onClick={(e) => {
                              console.log('Delete button rendered and clicked for:', template.id);
                              handleDeleteClick(e, template.id);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateOverview;