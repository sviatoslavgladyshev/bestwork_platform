import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './WorkflowSelection.css';
import HubspotIcon from '/assets/hubspot-icon.png';
import DriftIcon from '/assets/blue_icon.jpeg';
import SlackIcon from '/assets/slack-icon.png';

const WorkflowSelection = ({
  onBack,
  onSelect,
  resetSelection = 0,
  userEmail,
  firstName,
  lastName,
  isGmailConnected,
}) => {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const navigate = useNavigate();

  console.log('WorkflowSelection: Rendering with props:', {
    resetSelection,
    userEmail,
    firstName,
    lastName,
    isGmailConnected,
  });

  useEffect(() => {
    setSelectedCardId(null);
    console.log('WorkflowSelection: Resetting selection due to resetSelection=', resetSelection);
  }, [resetSelection]);

  const cards = [
    {
      id: 1,
      title: 'Pre-made',
      description:
        'Select a template from emails commonly replied to with pre-written responses you can modify.',
    },
    {
      id: 2,
      title: 'Custom',
      description:
        'Create a template for specific types of emails you reply to and heavily customize the response.',
    },
  ];

  const handleCardClick = (id) => {
    setSelectedCardId(selectedCardId === id ? null : id);
    console.log('WorkflowSelection: Card clicked, id=', id);
  };

  const handleSelectTemplate = () => {
    if (selectedCardId !== null) {
      const selectedCard = cards.find((card) => card.id === selectedCardId);
      console.log('WorkflowSelection: Selected template:', selectedCard.title);
      if (selectedCard.title === 'Pre-made') {
        console.log('WorkflowSelection: Navigating to premade-selection');
        navigate('/dashboard/premade-selection', {
          state: { resetSelection },
        });
      } else if (selectedCard.title === 'Custom') {
        console.log('WorkflowSelection: Navigating to create-template');
        navigate('/dashboard/create-template');
        onSelect();
      }
    }
  };

  return (
    <div className="workflow-selection-container">
      <h2 className="workflow-selection-title">Select type of workflow template</h2>
      <div className="workflow-selection-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`workflow-selection-item ${selectedCardId === card.id ? 'selected' : ''}`}
            onClick={() => handleCardClick(card.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(card.id)}
          >
            <div className="workflow-selection-icon-flow">
              <div className="workflow-selection-icon-item">
                <img src={HubspotIcon} alt="Hubspot" className="workflow-selection-icon" />
                <span className="workflow-selection-icon-label">Hubspot</span>
              </div>
              <div className="workflow-selection-icon-item">
                <img src={DriftIcon} alt="BestWork" className="workflow-selection-icon" />
                <span className="workflow-selection-icon-label">BestWork</span>
              </div>
              <div className="workflow-selection-icon-item">
                <img src={SlackIcon} alt="Slack" className="workflow-selection-icon" />
                <span className="workflow-selection-icon-label">Slack</span>
              </div>
            </div>
            <div className="workflow-selection-info">
              <h3 className="workflow-selection-name">{card.title}</h3>
              <p className="workflow-selection-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="workflow-selection-buttons">
        <button className="workflow-selection-back-button" onClick={onBack}>
          Back
        </button>
        <button
          className="workflow-selection-select-button"
          onClick={handleSelectTemplate}
          disabled={selectedCardId === null}
        >
          Select
        </button>
      </div>
    </div>
  );
};

WorkflowSelection.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  resetSelection: PropTypes.number,
  userEmail: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  isGmailConnected: PropTypes.bool,
};

export default WorkflowSelection;