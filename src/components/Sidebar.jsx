// src/components/Sidebar.jsx
import React from 'react';
import './dashboard.css';
import companyLogo from '/assets/logo_colors_3d.png';
import diagramBlueIcon from '/assets/dashboard_icon_sidebar.png';
import diagramBlackIcon from '/assets/dashbaord_grey_icon.png';
import settingsBlueIcon from '/assets/icon_settings_blue.png';
import settingsBlackIcon from '/assets/settings_white.png';

// Props:
// - activeTab: string ('Templates', 'Settings')
// - setActiveTab: function to update activeTab
// - navigate: function from useNavigate to handle routing
const Sidebar = ({ activeTab = 'Templates', setActiveTab, navigate }) => {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo">
        <img src={companyLogo} alt="Company Logo" />
      </div>
      <nav className="dashboard-nav">
        <button
          className={`dashboard-nav-item ${activeTab === 'Templates' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Templates');
            navigate('/dashboard'); // Navigate to the dashboard route for Template Overview
          }}
          aria-label="View Template Overview"
          data-tooltip="Template Overview"
        >
          <img
            src={activeTab === 'Templates' ? diagramBlueIcon : diagramBlackIcon}
            alt="Template Overview Icon"
            className="nav-icon"
          />
        </button>
      </nav>
      <div className="dashboard-settings">
        <button
          className={`dashboard-nav-item ${activeTab === 'Settings' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Settings');
            navigate('/settings');
          }}
          aria-label="Settings"
          data-tooltip="Settings"
        >
          <img
            src={activeTab === 'Settings' ? settingsBlueIcon : settingsBlackIcon}
            alt="Settings Icon"
            className="nav-icon"
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;