import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Auth } from "aws-amplify";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Onboarding from "./components/Onboarding";
import ForgotPassword from "./components/ForgotPassword";
import Settings from "./components/Settings";
import GoogleAppDetails from "./components/GoogleAppDetails";
import TemplateOverview from "./components/TemplateOverview";
import PreMadeSelection from "./components/PreMadeSelection";
import WorkflowSelection from "./components/WorkflowSelection";
import TemplateInputForm from "./components/TemplateInputForm";
import TemplateCreator from "./components/TemplateCreator";
import CreateTemplate from "./components/CreateTemplate";
import TabBar from "./components/TabBar";
import Sidebar from "./components/Sidebar";
import Privacypolicy from "./components/privacy-policy";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";

const processedCodes = new Set();
let isProcessing = false;

const CACHE_KEY = "userDataCache";

const RootRedirect = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await Auth.currentAuthenticatedUser();
        console.log("RootRedirect: User authenticated");
        setIsAuthenticated(true);
      } catch (err) {
        console.error("RootRedirect: Auth check failed:", err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />;
};

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);
  const [userData, setUserData] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached
        ? JSON.parse(cached)
        : {
            userEmail: "",
            firstName: "Unknown",
            lastName: "User",
            isGmailConnected: false,
            templates: [],
            lastFetched: 0,
          };
    } catch (err) {
      console.error("ProtectedRoute: Failed to parse initial cache:", err);
      return {
        userEmail: "",
        firstName: "Unknown",
        lastName: "User",
        isGmailConnected: false,
        templates: [],
        lastFetched: 0,
      };
    }
  });
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const authChecked = React.useRef(false);
  const pollIntervalRef = React.useRef(null);
  const pollFailureCountRef = React.useRef(0);

  const updateCacheAndState = (newData) => {
    setUserData(newData);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
  };

  const fetchUserData = async (isPolling = false) => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const email = user.attributes?.email || user.username;
      if (!email) throw new Error("User email not found");

      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        "https://tiyaf0vu0a.execute-api.us-east-1.amazonaws.com/dev/fetch-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email,
            fields: ["firstName", "lastName", "gmailToken", "templates"],
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
      console.log("ProtectedRoute: User data:", userDataResponse);

      const serverTemplates = userDataResponse.templates || [];
      const newUserData = {
        userEmail: email,
        firstName: userDataResponse.firstName || "Unknown",
        lastName: userDataResponse.lastName || "User",
        isGmailConnected: userDataResponse.isGmailConnected ?? false,
        templates: Array.isArray(serverTemplates) ? serverTemplates.map((server) => ({
          ...server,
          lastUpdated: server.lastUpdated || Date.now(),
        })) : [],
        lastFetched: Date.now(),
      };

      const hasChanges =
        newUserData.firstName !== userData.firstName ||
        newUserData.lastName !== userData.lastName ||
        newUserData.isGmailConnected !== userData.isGmailConnected ||
        JSON.stringify(newUserData.templates) !== JSON.stringify(userData.templates);

      if (hasChanges || isPolling) {
        console.log("ProtectedRoute: Updating state and cache");
        updateCacheAndState(newUserData);
      }

      if (!isPolling) {
        setAuthStatus(true);
        authChecked.current = true;
        setIsInitialLoad(false);
      }
      pollFailureCountRef.current = 0;
      return true;
    } catch (err) {
      console.error("ProtectedRoute: Fetch failed:", err);
      if (isPolling) {
        pollFailureCountRef.current += 1;
        if (pollFailureCountRef.current >= 5) {
          console.warn("ProtectedRoute: Stopping polling due to repeated failures");
          return false;
        }
      } else {
        setError(`Authentication failed: ${err.message}`);
        setAuthStatus(false);
        await Auth.signOut();
        localStorage.removeItem(CACHE_KEY);
        navigate("/signin", { state: { sessionExpired: true, error: err.message } });
      }
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (authChecked.current && !isInitialLoad) {
        console.log("ProtectedRoute: Skipping auth check");
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
          const delay = pollFailureCountRef.current > 0
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
  }, [navigate, location.pathname]);

  if (authStatus === null || isInitialLoad) {
    return (
      <div className="loading-overlay">
        <div className="loader"></div>
        <p className="loading-text">Authenticating...</p>
      </div>
    );
  }

  if (!authStatus) {
    return <Navigate to="/signin" state={{ fromProtected: true, error }} replace />;
  }

  console.log('ProtectedRoute: Passing props to children:', {
    ...userData,
    templates: userData.templates,
    setUserData: typeof setUserData,
    setIsGmailConnected: typeof setIsGmailConnected,
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
          setUserData: (newData) =>
            updateCacheAndState({
              ...userData,
              ...newData,
              lastFetched: Date.now(),
            }),
          setIsGmailConnected: (value) =>
            updateCacheAndState({
              ...userData,
              isGmailConnected: value,
              lastFetched: Date.now(),
            }),
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
        const authCode = searchParams.get("code");
        const email = searchParams.get("state");
        console.log("GoogleCallback - authCode:", authCode, "email:", email);
        if (!authCode || !email) throw new Error("Missing auth code or email");

        if (processedCodes.has(authCode)) {
          setLoading(false);
          return;
        }

        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          "https://39ormpmfi2.execute-api.us-east-1.amazonaws.com/dev/gmail-auth",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: idToken,
            },
            body: JSON.stringify({
              email,
              authCode,
              action: "authenticate",
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        const result = await response.json();
        console.log("GoogleCallback - Gmail auth API response:", JSON.stringify(result, null, 2));
        if (result.error) throw new Error(result.details || result.error);

        const gmailAuthResult = result.analysis?.gmailAuthResult;
        if (gmailAuthResult) {
          if (gmailAuthResult.needsAuth && gmailAuthResult.authUrl) {
            console.log("GoogleCallback - Redirecting to auth URL:", gmailAuthResult.authUrl);
            window.location.href = gmailAuthResult.authUrl;
            return;
          } else if (!gmailAuthResult.needsAuth && gmailAuthResult.isGmailConnected) {
            processedCodes.add(authCode);
            hasProcessed.current = true;
            console.log("GoogleCallback - Gmail connected, navigating to dashboard");
            navigate("/dashboard", { replace: true, state: { email, isGmailConnected: true } });
          } else {
            throw new Error("Unexpected auth result");
          }
        } else {
            throw new Error("Invalid response structure");
          }
      } catch (err) {
        console.error("GoogleCallback error:", err.message);
        setError(`Authentication failed: ${err.message}`);
        if (err.message.includes("invalid_grant") && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return handleCallback(retryCount + 1, maxRetries);
        }
      } finally {
        isProcessing = false;
        setLoading(false);
        localStorage.removeItem("inOnboarding");
        localStorage.removeItem("onboardingData");
        console.log("GoogleCallback - Cleared localStorage");
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (loading) return <div className="loading-overlay"><div className="spinner"></div><p>Processing...</p></div>;
  if (error)
    return (
      <div className="error-overlay">
        <h2>Gmail Authentication Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/onboarding")}>Return to Onboarding</button>
      </div>
    );
  return <Navigate to="/dashboard" replace />;
}

// Component to handle dashboard layout
function DashboardLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  firstName, 
  lastName, 
  setUserData,
  templateName,
  onTemplateNameChange,
  handleBack,
  handlePublish,
  isPublishing,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  console.log('DashboardLayout: Rendering with props:', { 
    activeTab, 
    firstName, 
    lastName, 
    templateName,
    handlePublish: !!handlePublish,
    isPublishing,
    location: location.pathname 
  });

  const handleTemplateOverviewCreateNewCurrent = (template = null) => {
    console.log('DashboardLayout: Navigating to workflow selection', { template });
    navigate('/dashboard/workflow-selection', { state: { template } });
  };

  return (
    <div className="dashboard-container">
      <TabBar
        activeTab={activeTab}
        firstName={firstName}
        lastName={lastName}
        handleTemplateOverviewCreateNewCurrent={handleTemplateOverviewCreateNewCurrent}
        handleUpgradeToPro={() => window.location.href = 'https://buy.stripe.com/6oUeVe72f0ZCaV23Vc8Ra0k'}
        templateName={templateName}
        onTemplateNameChange={onTemplateNameChange}
        handleBack={handleBack}
        handlePublish={handlePublish}
        isPublishing={isPublishing}
        routePath={location.pathname}
      />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

// Component to handle dashboard-related routes
function DashboardRoutes({ activeTab, setActiveTab, firstName, lastName, templates, setUserData, userEmail, isGmailConnected }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [resetCounter, setResetCounter] = useState(0);
  const [templateName, setTemplateName] = useState(location.state?.template?.name || '');
  const [templateData, setTemplateData] = useState(location.state?.template || null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleReset = () => {
    setResetCounter((prev) => prev + 1);
  };

  const handleTemplateNameChange = (e) => {
    const newName = e.target.value;
    console.log('DashboardRoutes: Updating templateName to:', newName);
    setTemplateName(newName);
    setTemplateData((prev) => ({ ...prev, name: newName }));
  };

  console.log('DashboardRoutes: Rendering for path:', location.pathname, {
    templateName,
    templateData,
    isPublishing,
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
            templateName={templateName}
            onTemplateNameChange={handleTemplateNameChange}
            handleBack={() => navigate('/dashboard')}
            handlePublish={() => {
              console.log('DashboardRoutes: Triggering CreateTemplate handlePublish');
              document.dispatchEvent(new CustomEvent('triggerPublish'));
            }}
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("Templates");
  const location = useLocation();

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

  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/template-creator" element={<TemplateCreator />} />
      <Route path="/template-input-form" element={<TemplateInputForm />} />
      <Route path="/privacy-policy" element={<Privacypolicy />} />
      <Route path="/google-app-details" element={<GoogleAppDetails />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ProtectedRoute><ForgotPassword /></ProtectedRoute>} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
          </ProtectedRoute>
        }
      />
      <Route path="/settings" element={<ProtectedRoute><Settings activeTab={activeTab} setActiveTab={setActiveTab} /></ProtectedRoute>} />
      <Route path="/google-callback" element={<GoogleCallback />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;