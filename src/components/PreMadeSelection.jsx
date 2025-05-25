import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreMadeSelection.css';
import HubspotIcon from '/assets/hubspot-icon.png';
import DriftIcon from '/assets/blue_icon.jpeg';
import SlackIcon from '/assets/slack-icon.png';

// Category mapping to align with CreateTemplate
const categoryMapping = {
  'Cold sales / pitch': 'Sales pitch',
  'Job application request': 'Other',
  'Unsolicited networking': 'Networking',
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

const PreMadeSelection = ({ onBack, setIsDiagramActive, onSave, resetSelection }) => {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const navigate = useNavigate();

  // Reset state when resetSelection changes
  useEffect(() => {
    setSelectedCardId(null);
    setIsDiagramActive(false);
  }, [resetSelection, setIsDiagramActive]);

  const cards = [
    {
      id: 1,
      title: 'Cold sales / pitch',
      description: 'Emails that try to sell you products you did not ask for / founders pitching.',
    },
    {
      id: 2,
      title: 'Job application request',
      description: 'Emails from people asking for jobs or students asking for internships.',
    },
    {
      id: 3,
      title: 'Unsolicited networking',
      description: 'Unsolicited requests from people you met at events or alumni.',
    },
  ];

  const handleCardClick = (id) => {
    setSelectedCardId(selectedCardId === id ? null : id);
  };

  const handleSelectTemplate = () => {
    if (selectedCardId === null) {
      console.warn('No card selected');
      return;
    }

    const selectedCard = cards.find((card) => card.id === selectedCardId);
    if (!selectedCard) {
      console.error('Selected card not found');
      return;
    }

    // Map the card title to a category and type
    const category = categoryMapping[selectedCard.title] || 'Other';
    const type = category === 'Other'
      ? selectedCard.title.toLowerCase().replace(/\s+/g, '-')
      : category.toLowerCase().replace(/\s+/g, '-');

    // Create template data aligned with CreateTemplate expectations
    const templateData = {
      name: selectedCard.title,
      type: type,
      tone: 'Professional',
      length: 50,
      emailExamples: [{ id: Date.now().toString(), text: '' }],
      customResponseStyle: '',
    };

    // Navigate directly to CreateTemplate
    navigate('/dashboard/create-template', {
      state: { template: templateData },
    });

    // Reset selection and call onSave
    setSelectedCardId(null);
    setIsDiagramActive(false);
    onSave();
  };

  return (
    <div className="premade-selection-container">
      <h2 className="premade-selection-title">Select a workflow to build</h2>
      <div className="premade-selection-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`premade-selection-item ${selectedCardId === card.id ? 'selected' : ''}`}
            onClick={() => handleCardClick(card.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(card.id)}
          >
            <div className="premade-selection-icon-flow">
              <div className="premade-selection-icon-item">
                <img src={HubspotIcon} alt="Hubspot" className="premade-selection-icon" />
                <span className="premade-selection-icon-label">Hubspot</span>
              </div>
              <div className="premade-selection-icon-item">
                <img src={DriftIcon} alt="BestWork" className="premade-selection-icon" />
                <span className="premade-selection-icon-label">BestWork</span>
              </div>
              <div className="premade-selection-icon-item">
                <img src={SlackIcon} alt="Slack" className="premade-selection-icon" />
                <span className="premade-selection-icon-label">Slack</span>
              </div>
            </div>
            <div className="premade-selection-info">
              <h3 className="premade-selection-name">{card.title}</h3>
              <p className="premade-selection-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="premade-selection-buttons">
        <button className="premade-selection-back-button" onClick={onBack}>
          Back
        </button>
        <button
          className="premade-selection-select-button"
          onClick={handleSelectTemplate}
          disabled={selectedCardId === null}
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default PreMadeSelection;