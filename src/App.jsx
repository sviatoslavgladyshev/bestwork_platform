import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Auth } from 'aws-amplify';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ForgotPassword from './components/ForgotPassword';
import Settings from './components/Settings';
import GoogleAppDetails from './components/GoogleAppDetails';
import TemplateOverview from './components/TemplateOverview';
import PreMadeSelection from './components/PreMadeSelection';
import WorkflowSelection from './components/WorkflowSelection';
import TemplateCreator from './components/TemplateCreator';
import CreateTemplate from './components/CreateTemplate';
import WelcomePage from './components/WelcomePage';
import WelcomeAgentCreator from './components/WelcomeAgentCreator';
import PricingPlan from './components/PricingPlan';
import EditEmailForm from './components/EditEmailForm';
import TabBar from './components/TabBar';
import Sidebar from './components/Sidebar';
import Privacypolicy from './components/privacy-policy';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-overlay">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const processedCodes = new Set();
let isProcessing = false;

const CACHE_KEY = 'userDataCache';

const RootRedirect = () => {
  return <Navigate to="/google-app-details" replace />;
};

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);
  const [userData, setUserData] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached || cached === 'undefined') {
        console.log('ProtectedRoute: No valid cache found, initializing default userData');
        return {
          userEmail: '',
          firstName: 'Unknown',
          lastName: 'User',
          isGmailConnected: false,
          isGcalConnected: false,
          templates: [],
          lastFetched: 0,
        };
      }
      return JSON.parse(cached);
    } catch (err) {
      console.error('ProtectedRoute: Failed to parse initial cache:', err);
      return {
        userEmail: '',
        firstName: 'Unknown',
        lastName: 'User',
        isGmailConnected: false,
        isGcalConnected: false,
        templates: [],
        lastFetched: 0,
      };
    }
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const authChecked = React.useRef(false);
  const pollIntervalRef = React.useRef(null);
  const pollFailureCountRef = React.useRef(0);
  const pausePollingUntilRef = React.useRef(0);

  const updateCacheAndState = (newData) => {
    console.log('ProtectedRoute: Updating cache and state:', newData);
    setUserData(newData);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.error('ProtectedRoute: Failed to update localStorage cache:', err);
    }
  };

  const fetchUserData = async (isPolling = false) => {
    if (isPolling && Date.now() < pausePollingUntilRef.current) {
      console.log('ProtectedRoute: Polling paused until:', new Date(pausePollingUntilRef.current));
      return false;
    }

    try {
      const user = await Auth.currentAuthenticatedUser();
      const email = user.attributes?.email || user.username;
      if (!email) throw new Error('User email not found');

      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        'https://tiyaf0vu0a.execute-api.us-east-1.amazonaws.com/dev/fetch-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email,
            fields: ['firstName', 'lastName', 'gmailToken', 'gCalToken', 'templates'],
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const userDataResponse = await response.json();
      console.log('ProtectedRoute: User data fetched:', userDataResponse);

      const serverTemplates = userDataResponse.templates || [];
      const newUserData = {
        userEmail: email,
        firstName: userDataResponse.firstName || 'Unknown',
        lastName: userDataResponse.lastName || 'User',
        isGmailConnected: userDataResponse.isGmailConnected ?? false,
        isGcalConnected: userDataResponse.isGcalConnected ?? false,
        gmailEmail: userDataResponse.gmailEmail || '',
        calendarEmail: userDataResponse.calendarEmail || '',
        templates: Array.isArray(serverTemplates)
          ? serverTemplates.map((server) => ({
              ...server,
              lastUpdated: server.lastUpdated || Date.now(),
            }))
          : [],
        lastFetched: Date.now(),
      };

      const hasChanges =
        newUserData.firstName !== userData.firstName ||
        newUserData.lastName !== userData.lastName ||
        newUserData.isGmailConnected !== userData.isGmailConnected ||
        newUserData.isGcalConnected !== userData.isGcalConnected ||
        JSON.stringify(newUserData.templates) !== JSON.stringify(userData.templates);

      if (hasChanges || isPolling) {
        console.log('ProtectedRoute: Updating state and cache with server data');
        updateCacheAndState(newUserData);
      }

      if (!isPolling && !authChecked.current) {
        setAuthStatus(true);
        authChecked.current = true;
      }
      pollFailureCountRef.current = 0;
      return true;
    } catch (err) {
      console.error('ProtectedRoute: Fetch failed:', err);
      if (isPolling) {
        pollFailureCountRef.current += 1;
        if (pollFailureCountRef.current >= 5) {
          console.warn('ProtectedRoute: Stopping polling due to repeated failures');
          return false;
        }
      } else if (!authChecked.current) {
        setError(`Authentication failed: ${err.message}`);
        setAuthStatus(false);
        await Auth.signOut();
        localStorage.removeItem(CACHE_KEY);
        navigate('/signin', { state: { sessionExpired: true, error: err.message } });
      }
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (authChecked.current) {
        console.log('ProtectedRoute: Skipping auth check, already authenticated');
        const cacheAge = Date.now() - userData.lastFetched;
        if (cacheAge > 5 * 60 * 1000) {
          fetchUserData();
        }
        return;
      }
      console.log(`ProtectedRoute: Checking auth for path: ${location.pathname}`);
      await fetchUserData();
    };

    const startPolling = () => {
      if (pollIntervalRef.current) return;
      const poll = async () => {
        const success = await fetchUserData(true);
        if (success && isMounted) {
          const delay =
            pollFailureCountRef.current > 0
              ? Math.min(60000 * Math.pow(2, pollFailureCountRef.current), 300000)
              : 60000;
          pollIntervalRef.current = setTimeout(poll, delay);
        }
      };
      poll();
    };

    checkAuth().then(() => {
      if (isMounted && authStatus) {
        startPolling();
      }
    });

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [location.pathname, navigate]);

  if (authStatus === null && !authChecked.current && !userData.userEmail) {
    return (
      <div className="loading-overlay">
        <div className="loader"></div>
        <p className="loading-text">Authenticating...</p>
      </div>
    );
  }

  if (!authStatus && authChecked.current) {
    return <Navigate to="/signin" state={{ fromProtected: true, error }} replace />;
  }

  console.log('ProtectedRoute: Passing props to children:', {
    ...userData,
    setUserData: (newData) => {
      console.log('ProtectedRoute: setUserData called with:', newData);
      pausePollingUntilRef.current = Date.now() + 10000;
      updateCacheAndState(newData);
    },
  });

  return (
    <Suspense
      fallback={
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      }
    >
      {React.isValidElement(children) ? (
        React.cloneElement(children, {
          ...children.props,
          ...userData,
          setUserData: (newData) => {
            console.log('ProtectedRoute: setUserData called with:', newData);
            pausePollingUntilRef.current = Date.now() + 10000;
            updateCacheAndState(newData);
          },
        })
      ) : (
        children
      )}
    </Suspense>
  );
};

function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasProcessed = React.useRef(false);

  useEffect(() => {
    if (hasProcessed.current || isProcessing) {
      setLoading(false);
      return;
    }

    const handleCallback = async (retryCount = 0, maxRetries = 3) => {
      isProcessing = true;
      try {
        const authCode = searchParams.get('code');
        const email = searchParams.get('state');
        console.log('GoogleCallback - authCode:', authCode ? '[REDACTED]' : null, 'email:', email);

        if (!authCode || !email) {
          throw new Error('Missing auth code or email in query parameters');
        }

        if (processedCodes.has(authCode)) {
          console.log('GoogleCallback - Auth code already processed');
          setLoading(false);
          return;
        }

        let idToken;
        try {
          const session = await Auth.currentSession();
          idToken = session.getIdToken().getJwtToken();
        } catch (sessionErr) {
          console.error('GoogleCallback - Session error:', sessionErr);
          throw new Error('Invalid session. Please sign in again.');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          'https://39ormpmfi2.execute-api.us-east-1.amazonaws.com/dev/gmail-auth',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: idToken,
            },
            body: JSON.stringify({
              email,
              authCode,
              action: 'authenticate',
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        const result = await response.json();
        console.log('GoogleCallback - API response:', result);

        if (!response.ok || result.error) {
          throw new Error(
            result.details || result.error || `API error (Status: ${response.status})`
          );
        }

        const gmailAuthResult = result.analysis?.gmailAuthResult;
        if (!gmailAuthResult) {
          throw new Error('Invalid API response: Missing gmailAuthResult');
        }

        if (gmailAuthResult.needsAuth && gmailAuthResult.authUrl) {
          console.log('GoogleCallback - Redirecting to auth URL:', gmailAuthResult.authUrl);
          window.location.href = gmailAuthResult.authUrl;
          return;
        } else if (!gmailAuthResult.needsAuth && gmailAuthResult.isGmailConnected) {
          processedCodes.add(authCode);
          hasProcessed.current = true;
          console.log('GoogleCallback - Gmail connected, navigating to dashboard');
          navigate('/dashboard', {
            replace: true,
            state: { email, isGmailConnected: true },
          });
        } else {
          throw new Error('Unexpected auth result');
        }
      } catch (err) {
        const errorMessage = err.message || String(err) || 'Unknown authentication error';
        console.error('GoogleCallback error:', errorMessage, err.stack || err);

        if (errorMessage.includes('invalid_grant') && retryCount < maxRetries) {
          console.log(`GoogleCallback - Retrying (${retryCount + 1}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return handleCallback(retryCount + 1, maxRetries);
        }

        setError(`Authentication failed: ${errorMessage}`);
      } finally {
        isProcessing = false;
        setLoading(false);
        localStorage.removeItem('inOnboarding');
        localStorage.removeItem('onboardingData');
        localStorage.removeItem('inAuth');
        console.log('GoogleCallback - Cleared specific localStorage keys');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Processing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-overlay">
        <h2>Gmail Authentication Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/signin')}>
          Return to Sign In
        </button>
      </div>
    );
  }

  return <Navigate to="/dashboard" replace />;
};

function GoogleCalendarCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasProcessed = React.useRef(false);

  useEffect(() => {
    if (hasProcessed.current || isProcessing) {
      setLoading(false);
      return;
    }

    const handleCallback = async (retryCount = 0, maxRetries = 3) => {
      isProcessing = true;
      try {
        const authCode = searchParams.get('code');
        const email = searchParams.get('state');
        console.log('GoogleCalendarCallback - authCode:', authCode ? '[REDACTED]' : null, 'email:', email);

        if (!authCode || !email) {
          throw new Error('Missing auth code or email in query parameters');
        }

        if (processedCodes.has(authCode)) {
          console.log('GoogleCalendarCallback - Auth code already processed');
          setLoading(false);
          return;
        }

        let idToken;
        try {
          const session = await Auth.currentSession();
          idToken = session.getIdToken().getJwtToken();
        } catch (sessionErr) {
          console.error('GoogleCalendarCallback - Session error:', sessionErr);
          throw new Error('Invalid session. Please sign in again.');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          'https://1m2ribx1tc.execute-api.us-east-1.amazonaws.com/dev/gcal-auth',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: idToken,
            },
            body: JSON.stringify({
              email,
              authCode,
              action: 'authenticate',
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        const result = await response.json();
        console.log('GoogleCalendarCallback - API response:', result);

        if (!response.ok || result.error) {
          throw new Error(
            result.details || result.error || `API error (Status: ${response.status})`
          );
        }

        const gcalAuthResult = result.analysis?.gcalAuthResult;
        if (!gcalAuthResult) {
          throw new Error('Invalid API response: Missing gcalAuthResult');
        }

        if (gcalAuthResult.needsAuth && gcalAuthResult.authUrl) {
          console.log('GoogleCalendarCallback - Redirecting to auth URL:', gcalAuthResult.authUrl);
          window.location.href = gcalAuthResult.authUrl;
          return;
        } else if (!gcalAuthResult.needsAuth && gcalAuthResult.isGcalConnected) {
          processedCodes.add(authCode);
          hasProcessed.current = true;
          console.log('GoogleCalendarCallback - Google Calendar connected, navigating to settings');
          navigate('/settings', {
            replace: true,
            state: { email, isGcalConnected: true },
          });
        } else {
          throw new Error('Unexpected auth result');
        }
      } catch (err) {
        const errorMessage = err.message || String(err) || 'Unknown authentication error';
        console.error('GoogleCalendarCallback error:', errorMessage, err.stack || err);

        if (errorMessage.includes('invalid_grant') && retryCount < maxRetries) {
          console.log(`GoogleCalendarCallback - Retrying (${retryCount + 1}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return handleCallback(retryCount + 1, maxRetries);
        }

        setError(`Google Calendar authentication failed: ${errorMessage}`);
      } finally {
        isProcessing = false;
        setLoading(false);
        localStorage.removeItem('inAuth');
        console.log('GoogleCalendarCallback - Cleared inAuth localStorage key');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Processing Google Calendar authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-overlay">
        <h2>Google Calendar Authentication Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/settings')}>
          Return to Settings
        </button>
      </div>
    );
  }

  return <Navigate to="/settings" replace />;
};

function DashboardLayout({
  children,
  activeTab,
  setActiveTab,
  firstName,
  lastName,
  setUserData,
  isPublishing,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  console.log('DashboardLayout: Rendering with props:', {
    activeTab,
    firstName,
    lastName,
    isPublishing,
    location: location.pathname,
  });

  const handleTemplateOverviewCreateNewCurrent = (template = null) => {
    console.log('DashboardLayout: Navigating to template creator', { template });
    navigate('/dashboard/template-creator', { state: { template } });
  };

  return (
    <div className="dashboard-container">
      <TabBar
        activeTab={activeTab}
        firstName={firstName}
        lastName={lastName}
        handleTemplateOverviewCreateNewCurrent={handleTemplateOverviewCreateNewCurrent}
        handleUpgradeToPro={() => (window.location.href = 'https://buy.stripe.com/6oUeVe72f0ZCaV23Vc8Ra0k')}
        routePath={location.pathname}
      />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
      <main className="dashboard-content">{children}</main>
    </div>
  );
};

function DashboardRoutes({ activeTab, setActiveTab, firstName, lastName, templates, setUserData, userEmail, isGmailConnected, isGcalConnected }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [resetCounter, setResetCounter] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateData, setTemplateData] = useState({});

  const handleReset = () => {
    setResetCounter((prev) => prev + 1);
  };

  const handleTemplateNameChange = (e) => {
    setTemplateName(e.target.value);
    setTemplateData((prev) => ({ ...prev, title: e.target.value }));
  };

  console.log('DashboardRoutes: Rendering for path:', location.pathname, {
    isPublishing,
    templates,
  });

  return (
    <Routes key={location.pathname}>
      <Route
        path=""
        element={
          <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            firstName={firstName}
            lastName={lastName}
            setUserData={setUserData}
            isPublishing={isPublishing}
          >
            <TemplateOverview
              templates={templates}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              firstName={firstName}
              lastName={lastName}
              setUserData={setUserData}
            />
          </DashboardLayout>
        }
      />
      <Route
        path="premade-selection"
        element={
          <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            firstName={firstName}
            lastName={lastName}
            setUserData={setUserData}
            isPublishing={isPublishing}
          >
            <PreMadeSelection
              onBack={() => {
                navigate('/dashboard');
                handleReset();
              }}
              onSave={() => {}}
              resetSelection={resetCounter}
              setIsDiagramActive={() => {}}
            />
          </DashboardLayout>
        }
      />
      <Route
        path="workflow-selection"
        element={
          <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            firstName={firstName}
            lastName={lastName}
            setUserData={setUserData}
            isPublishing={isPublishing}
          >
            <WorkflowSelection
              onBack={() => {
                navigate('/dashboard');
                handleReset();
              }}
              onSelect={() => console.log('Workflow selected')}
              resetSelection={resetCounter}
              userEmail={userEmail}
              firstName={firstName}
              lastName={lastName}
              isGmailConnected={isGmailConnected}
              isGcalConnected={isGcalConnected}
            />
          </DashboardLayout>
        }
      />
      <Route
        path="create-template"
        element={
          <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            firstName={firstName}
            lastName={lastName}
            setUserData={setUserData}
            isPublishing={isPublishing}
          >
            <CreateTemplate
              userEmail={userEmail}
              handleBack={() => navigate('/dashboard')}
              templateName={templateName}
              onTemplateNameChange={handleTemplateNameChange}
              templateData={templateData}
              setTemplateData={setTemplateData}
              isPublishing={isPublishing}
              setIsPublishing={setIsPublishing}
            />
          </DashboardLayout>
        }
      />
      <Route
        path="edit-template/:id"
        element={
          <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            firstName={firstName}
            lastName={lastName}
            setUserData={setUserData}
            isPublishing={isPublishing}
          >
            <EditEmailForm
              userEmail={userEmail}
              handleBack={() => navigate('/dashboard')}
              templates={templates}
              setUserData={setUserData}
              isPublishing={isPublishing}
              setIsPublishing={setIsPublishing}
              templateName={templateName}
              onTemplateNameChange={handleTemplateNameChange}
            />
          </DashboardLayout>
        }
      />
      <Route
        path="template-creator"
        element={
          <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            firstName={firstName}
            lastName={lastName}
            setUserData={setUserData}
            isPublishing={isPublishing}
          >
            <TemplateCreator
              userEmail={userEmail}
              handleBack={() => navigate('/dashboard')}
              templateName={templateName}
              onTemplateNameChange={handleTemplateNameChange}
              templateData={templateData}
              setTemplateData={setTemplateData}
              isPublishing={isPublishing}
              setIsPublishing={setIsPublishing}
            />
          </DashboardLayout>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('Templates');
  const [templateName, setTemplateName] = useState('');
  const [templateData, setTemplateData] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const email = user.attributes?.email || user.username;
        if (!email) {
          throw new Error('User email not found');
        }
        setUserEmail(email);
      } catch (err) {
        const errorMessage = err.message || String(err) || 'Unknown error';
        console.error('App: Failed to fetch user:', errorMessage);
        setUserEmail('');
        if (
          location.pathname.startsWith('/dashboard') ||
          location.pathname === '/settings'
        ) {
          navigate('/signin', {
            state: { sessionExpired: true, error: errorMessage },
          });
        }
      }
    };
    fetchUser();
  }, [location.pathname, navigate]);

  useEffect(() => {
    const pathname = location.pathname;
    console.log('App: Location changed:', pathname);
    if (pathname.startsWith('/settings')) {
      setActiveTab('Settings');
    } else if (pathname.startsWith('/dashboard')) {
      setActiveTab('Templates');
    } else {
      setActiveTab('Templates');
    }
  }, [location.pathname]);

  const onTemplateNameChange = (e) => {
    setTemplateName(e.target.value);
    setTemplateData((prev) => ({ ...prev, title: e.target.value }));
  };

  return (
    <ErrorBoundary>
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          classNames="page"
          timeout={600}
        >
          <div className="page-wrapper">
            <Routes location={location}>
              <Route
                path="/signup"
                element={
                  <div className="page-content">
                    <SignUp />
                  </div>
                }
              />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route
                path="/welcome/agent-creator"
                element={
                  <WelcomeAgentCreator
                    userEmail={userEmail}
                    templateName={templateName}
                    onTemplateNameChange={onTemplateNameChange}
                    templateData={templateData}
                    setTemplateData={setTemplateData}
                  />
                }
              />
              <Route
                path="/pricing"
                element={
                  <div className="page-content">
                    <PricingPlan />
                  </div>
                }
              />
              <Route path="/privacy-policy" element={<Privacypolicy />} />
              <Route path="/google-app-details" element={<GoogleAppDetails />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <DashboardRoutes
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      userEmail={userEmail}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings activeTab={activeTab} setActiveTab={setActiveTab} />
                  </ProtectedRoute>
                }
              />
              <Route path="/google-callback" element={<GoogleCallback />} />
              <Route path="/gcal-callback" element={<GoogleCalendarCallback />} />
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/google-app-details" replace />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </ErrorBoundary>
  );
};

export default App;