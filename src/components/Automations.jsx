import React, { useState } from 'react';
import './Automations.css';
import noAutomationsImage from '/assets/my_workflow_no_automations.png'; // Import the image

const Automations = ({ automations, onCardClick }) => {
  const [showDropdown, setShowDropdown] = useState(null); // Track which card's dropdown is open

  // Filter out any automation with the name "American automation" (case-insensitive)
  const filteredAutomations = automations.filter(
    (automation) => automation.name.toLowerCase() !== 'american automation'
  );

  const handleToggleStatus = (id) => {
    filteredAutomations.find((automation) => automation.id === id).isActive = true;
    setShowDropdown(null); // Close dropdown after clicking the option
  };

  const handleCardClick = (automation) => {
    onCardClick(automation);
  };

  const handleMoreOptionsClick = (id, e) => {
    e.stopPropagation(); // Prevent card click when clicking more options
    setShowDropdown(showDropdown === id ? null : id);
  };

  return (
    <div className="automations-container">
      <h2 className="automations-title">My Workflow</h2>
      {filteredAutomations.length > 0 ? (
        <div className="automations-grid">
          {filteredAutomations.map((automation) => (
            <div
              key={automation.id}
              className="automation-item"
              onClick={() => handleCardClick(automation)}
              style={{ cursor: 'pointer' }}
            >
              <div className="status-container">
                <span
                  className={`status-label ${automation.isActive ? 'active' : 'inactive'}`}
                >
                  {automation.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="more-options-container">
                  {!automation.isActive && (
                    <div
                      className="more-options"
                      onClick={(e) => handleMoreOptionsClick(automation.id, e)}
                    >
                      ⋮
                    </div>
                  )}
                  {showDropdown === automation.id && !automation.isActive && (
                    <div className="dropdown-menu">
                      <div
                        className="dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleToggleStatus(automation.id);
                        }}
                      >
                        Start automation
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="automation-info">
                <span className="automation-name">{automation.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-automations">
          <img
            src={noAutomationsImage}
            alt="No automations"
            className="no-automations-image"
          />
          <div className="no-automations-text">
            <h3 className="no-automations-title">A place for all your workflows</h3>
            <p className="no-automations-subtext">
              Click “Create new” to build your first workflow
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automations;