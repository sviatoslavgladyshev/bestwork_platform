import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import './Dashboard.css';
import TemplateOverview from './TemplateOverview';
import PreMadeSelection from './PreMadeSelection';
import WorkflowSelection from './WorkflowSelection';
import CreateTemplate from './CreateTemplate';
import TemplateCreator from './TemplateCreator';
import EditEmailForm from './EditEmailForm';
import TabBar from './TabBar';
import Sidebar from './Sidebar';
import diagramBlueIcon from '/assets/icon_diagram_blue.png';
import diagramBlackIcon from '/assets/icon_diagram_grey.png';
import currentBlueIcon from '/assets/icon_current_blue.png';
import currentBlackIcon from '/assets/icon_current_grey.png';
import settingsBlueIcon from '/assets/icon_settings_blue.png';
import settingsBlackIcon from '/assets/icon_settings_grey.png';
import companyLogo from '/assets/blue_icon.jpeg';

const imagesToPreload = [
  diagramBlueIcon,
  diagramBlackIcon,
  currentBlueIcon,
  currentBlackIcon,
  settingsBlueIcon,
  settingsBlackIcon,
  companyLogo,
];

export default function Dashboard({ activeTab, setActiveTab, firstName, lastName, templates, setUserData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false); // Start with false to avoid initial loading
  const imagesLoadedRef = useRef(false);
  const [error, setError] = useState(null);
  const [resetCounter, setResetCounter] = useState(0);
  const [templateName, setTemplateName] = useState(location.state?.template?.title || '');
  const [isPublishing, setIsPublishing] = useState(false);
  const [templateData, setTemplateData] = useState(location.state?.template || {});

  const handleReset = () => {
    setResetCounter((prev) => prev + 1);
  };

  useEffect(() => {
    const preloadImages = async () => {
      if (imagesLoadedRef.current) return;
      const promises = imagesToPreload.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(promises);
      console.log('Dashboard: Images preloaded');
      imagesLoadedRef.current = true;
    };
    preloadImages();
  }, []);

  const handleTemplateOverviewCreateNewCurrent = (template = null) => {
    console.log('Dashboard: Navigating to template creator', { template });
    navigate('/dashboard/template-creator', { state: { template } });
  };

  const handleUpgradeToPro = () => {
    console.log('Dashboard: Navigating to upgrade to pro');
    window.location.href = 'https://buy.stripe.com/6oUeVe72f0ZCaV23Vc8Ra0k';
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleTemplateNameChange = (e) => {
    const newName = e.target.value;
    console.log('Dashboard: Updating templateName to:', newName);
    setTemplateName(newName);
    setTemplateData((prev) => ({ ...prev, title: newName }));
  };

  const handlePublish = async () => {
    if (!templateData) {
      alert('No template data to publish.');
      console.error('Dashboard: Template data is null');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to publish this template?');
    if (!confirmed) {
      console.log('Dashboard: Publish cancelled by user');
      return;
    }

    setIsPublishing(true);
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const userEmail = setUserData.userEmail;

      if (!userEmail) {
        throw new Error('User email is not available');
      }

      const payload = {
        userEmail,
        templateName,
        category: templateData.category || 'client_communications',
        scenarios: templateData.scenarios || [],
        scenarioDetails: templateData.scenarioDetails || {},
        workflowTitle: templateName,
        workflowDescription: templateData.description || '',
      };

      console.log('Dashboard: Sending API request to publish:', { payload });

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

      console.log('Dashboard: API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Dashboard: API error response:', errorData);
        throw new Error(errorData.error || 'Failed to publish template');
      }

      const result = await response.json();
      console.log('Dashboard: Template published successfully:', result);

      const cachedData = JSON.parse(localStorage.getItem('userDataCache') || '{}');
      const newTemplate = {
        ...templateData,
        title: templateName,
        id: result.templateId || Date.now().toString(),
        category: result.category || 'client_communications',
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
      console.error('Dashboard: Error publishing template:', error.message, error.stack);
      alert(`Failed to publish template: ${error.message}. Please try again.`);
    } finally {
      setIsPublishing(false);
    }
  };

  if (error) {
    return (
      <div className="error-message">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/signin', { state: { sessionExpired: true } })}>Sign In</button>
      </div>
    );
  }

  console.log('Dashboard: Rendering with activeTab=', activeTab, 'path=', location.pathname);
  console.log('Dashboard: Passing to TabBar:', {
    activeTab,
    routePath: location.pathname,
    handleTemplateOverviewCreateNewCurrent: !!handleTemplateOverviewCreateNewCurrent,
    templateName,
    setTemplateData: !!setTemplateData,
  });

  return (
    <div className="dashboard-container">
      <TabBar
        activeTab={activeTab}
        firstName={firstName}
        lastName={lastName}
        handleTemplateOverviewCreateNewCurrent={handleTemplateOverviewCreateNewCurrent}
        handleUpgradeToPro={handleUpgradeToPro}
        routePath={location.pathname}
        templateName={templateName}
        onTemplateNameChange={handleTemplateNameChange}
        handleBack={location.pathname.includes('/dashboard/create-template') || location.pathname.includes('/dashboard/template-creator') || location.pathname.includes('/dashboard/edit-template') ? handleBack : undefined}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
      />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
      <main className="dashboard-content">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <TemplateOverview
                templates={templates}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                firstName={firstName}
                lastName={lastName}
                setUserData={setUserData}
                handleTemplateOverviewCreateNewCurrent={handleTemplateOverviewCreateNewCurrent}
              />
            }
          />
          <Route
            path="premade-selection"
            element={
              <PreMadeSelection
                onBack={() => {
                  navigate('/dashboard');
                  handleReset();
                }}
                onSave={() => {}}
                resetSelection={resetCounter}
                setIsDiagramActive={() => {}}
              />
            }
          />
          <Route
            path="workflow-selection"
            element={
              <WorkflowSelection
                onBack={() => {
                  navigate('/dashboard');
                  handleReset();
                }}
                onSelect={() => console.log('Workflow selected')}
                resetSelection={resetCounter}
                navigate={navigate}
                firstName={firstName}
                lastName={lastName}
              />
            }
          />
          <Route
            path="create-template"
            element={
              <CreateTemplate
                userEmail={setUserData.userEmail}
                handleBack={handleBack}
                templateName={templateName}
                onTemplateNameChange={handleTemplateNameChange}
                templateData={templateData}
                setTemplateData={setTemplateData}
                handlePublish={handlePublish}
                isPublishing={isPublishing}
              />
            }
          />
          <Route
            path="template-creator"
            element={
              <TemplateCreator
                userEmail={setUserData.userEmail}
                handleBack={handleBack}
                templateName={templateName}
                onTemplateNameChange={handleTemplateNameChange}
                templateData={templateData}
                setTemplateData={setTemplateData}
                handlePublish={handlePublish}
                isPublishing={isPublishing}
              />
            }
          />
          <Route
            path="edit-template/:id"
            element={
              <EditEmailForm
                userEmail={setUserData.userEmail}
                handleBack={handleBack}
                templates={templates}
                setUserData={setUserData}
                isPublishing={isPublishing}
                setIsPublishing={setIsPublishing}
                templateName={templateName}
                onTemplateNameChange={handleTemplateNameChange}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}