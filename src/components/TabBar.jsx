import React from 'react';
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
  console.log('TabBar: Props:', {
    activeTab,
    routePath,
    templateName,
    handleTemplateOverviewCreateNewCurrent: !!handleTemplateOverviewCreateNewCurrent,
    handleBack: !!handleBack,
    handlePublish: !!handlePublish,
    isPublishing,
  });

  const isSelectionRoute = routePath?.includes('/dashboard/workflow-selection') || routePath?.includes('/dashboard/premade-selection');
  const isCreateTemplateRoute = routePath?.includes('/dashboard/create-template');
  console.log('TabBar: isCreateTemplateRoute:', isCreateTemplateRoute);

  return (
    <div className="dashboard-tab-bar">
      <div
        className={`dashboard-tab-bar-content ${
          activeTab === 'Templates' && !isCreateTemplateRoute ? 'template-overview-tab' : ''
        } ${isCreateTemplateRoute ? 'create-template-active' : ''}`}
      >
        {isCreateTemplateRoute ? (
          <div className="tab-bar-content">
            <div className="tab-bar-left">
              {handleBack && (
                <button
                  className="create-template-back-button"
                  onClick={handleBack}
                  aria-label="Go back to templates"
                >
                  <img
                    src="/assets/back_button_left_arrow.png"
                    alt=""
                    className="back-button-icon"
                  />
                  <span className="back-button-text">Back</span>
                </button>
              )}
              <input
                type="text"
                value={templateName}
                onChange={(e) => {
                  console.log('TabBar: Template name input changed:', e.target.value);
                  onTemplateNameChange(e);
                }}
                className="create-template-name-input"
                placeholder="Untitled template"
                aria-label="Template name"
              />
            </div>
            <div className="create-template-controls">
              {handleUpgradeToPro && (
                <button
                  className="upgrade-to-pro-button"
                  onClick={handleUpgradeToPro}
                  aria-label="Upgrade to Pro plan"
                >
                  Upgrade to Pro
                </button>
              )}
              {isCreateTemplateRoute && (
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
              {activeTab === 'Templates' && !isSelectionRoute && handleTemplateOverviewCreateNewCurrent ? (
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