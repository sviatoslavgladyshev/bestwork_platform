import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './dashboard.css';

const TabBar = ({
  activeTab,
  firstName,
  lastName,
  handleTemplateOverviewCreateNewCurrent,
  handleUpgradeToPro,
  templateName,
  handleBack,
  handlePublish,
  isPublishing,
  routePath,
  onTemplateNameChange,
}) => {
  // Debug logs to verify props and route
  console.log('TabBar Debug:', {
    routePath,
    handleBack: !!handleBack,
    activeTab,
    templateName,
    isPublishing,
    isTemplateRelatedRoute:
      routePath?.includes('/dashboard/create-template') ||
      routePath?.includes('/dashboard/edit-template') ||
      routePath?.includes('/dashboard/template-creator'),
  });

  // Fallback navigation using useNavigate
  const navigate = useNavigate();
  const defaultHandleBack = () => {
    console.log('Default handleBack: Navigating to /dashboard');
    navigate('/dashboard');
  };

  // Handle button click
  const onBackClick = () => {
    console.log('Dashboard button clicked');
    if (handleBack) {
      console.log('Using provided handleBack');
      handleBack();
    } else {
      console.log('handleBack not provided, using defaultHandleBack');
      defaultHandleBack();
    }
  };

  // Determine if we're on a template-related route where the Dashboard button should show
  const isTemplateRelatedRoute =
    routePath?.includes('/dashboard/create-template') ||
    routePath?.includes('/dashboard/edit-template') ||
    routePath?.includes('/dashboard/template-creator');

  return (
    <div className="dashboard-tab-bar">
      <div
        className={`dashboard-tab-bar-content ${
          activeTab === 'Templates' && !isTemplateRelatedRoute ? 'template-overview-tab' : ''
        } ${isTemplateRelatedRoute ? 'create-template-active' : ''}`}
      >
        {isTemplateRelatedRoute ? (
          <div className="tab-bar-content">
            <div className="tab-bar-left">
              {/* Dashboard button for template-related routes */}
              <button
                className="create-template-back-button"
                onClick={onBackClick}
                aria-label="Go to dashboard"
              >
                <img
                  src="/assets/chevron_white_back.png"
                  alt=""
                  className="back-button-icon"
                />
                <span className="back-button-text">Dashboard</span>
              </button>
              <span className="edit-template-title-tab-bar">
                {routePath?.includes('/dashboard/create-template')
                  ? 'Create Agent'
                  : routePath?.includes('/dashboard/edit-template')
                  ? 'Edit Agent'
                  : routePath?.includes('/dashboard/template-creator')
                  ? 'Create Agent'
                  : ''}
              </span>
            </div>
            <div className="create-template-controls">
              {routePath?.includes('/dashboard/create-template') && (
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => {
                    console.log('TabBar: Template name input changed:', e.target.value);
                    onTemplateNameChange(e);
                  }}
                  className="create-template-name-input"
                  placeholder="Untitled agent"
                  aria-label="Template name"
                />
              )}
              {handleUpgradeToPro && (
                <button
                  className="upgrade-to-pro-button"
                  onClick={handleUpgradeToPro}
                  aria-label="Upgrade to Pro plan"
                >
                  Upgrade to Pro
                </button>
              )}
              {handlePublish && routePath?.includes('/dashboard/create-template') && (
                <button
                  className="publish-button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  aria-label={isPublishing ? 'Publishing template' : 'Publish template'}
                >
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="welcome-message">
              <span>Welcome, {firstName} {lastName}</span>
            </div>
            <div className="automations-tab-controls">
              {handleUpgradeToPro && (
                <button
                  className="upgrade-to-pro-button"
                  onClick={handleUpgradeToPro}
                  aria-label="Upgrade to Pro plan"
                >
                  Upgrade to Pro
                </button>
              )}
              {activeTab === 'Templates' && handleTemplateOverviewCreateNewCurrent ? (
                <button
                  className="current-tab-create-new-button"
                  onClick={() => handleTemplateOverviewCreateNewCurrent(null)}
                  aria-label="Create new template"
                >
                  <span className="plus-create-new">+</span>Create New
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

TabBar.propTypes = {
  activeTab: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  handleTemplateOverviewCreateNewCurrent: PropTypes.func,
  handleUpgradeToPro: PropTypes.func,
  templateName: PropTypes.string,
  handleBack: PropTypes.func,
  handlePublish: PropTypes.func,
  isPublishing: PropTypes.bool,
  routePath: PropTypes.string,
  onTemplateNameChange: PropTypes.func,
};

export default TabBar;