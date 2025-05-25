import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import config from '../config';
import './Settings.css';
import { FaGoogle } from 'react-icons/fa';
import TabBar from './TabBar';
import Sidebar from './Sidebar';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught error:', error, error.stack);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const Settings = ({ userEmail, firstName, lastName, isGmailConnected, setIsGmailConnected, activeTab, setActiveTab }) => {
  console.log('Settings.jsx rendering:', { userEmail, isGmailConnected });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [signOutError, setSignOutError] = useState(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState(null);
  const [disconnectLoading, setDisconnectLoading] = useState({ gmail: false });
  const [disconnectError, setDisconnectError] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [newPassword, setNewPassword] = useState('');

  const gmailApiBase = config.gmail?.apiBaseUrl || 'https://39ormpmfi2.execute-api.us-east-1.amazonaws.com/dev/gmail-auth';
  const gmailDisconnectApiBase = 'https://trnf47jkj2.execute-api.us-east-1.amazonaws.com/dev/gmail-disconnect';
  const deleteAccountApiBase = 'https://l07ve60hr3.execute-api.us-east-1.amazonaws.com/dev/delete-account';

  const handleSignOutClick = () => {
    setShowConfirmDialog(true);
    setSignOutError(null);
  };

  const handleCancelSignOut = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirmSignOut = async () => {
    setShowConfirmDialog(false);
    setSignOutLoading(true);
    setSignOutError(null);

    try {
      await Auth.signOut({ global: true });
      localStorage.removeItem('userDataCache');
      navigate('/signin', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      setSignOutError('Failed to sign out. Please try again.');
    } finally {
      setSignOutLoading(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirmDialog(true);
    setDeleteError(null);
  };

  const handleCancelDeleteAccount = () => {
    setShowDeleteConfirmDialog(false);
  };

  const handleConfirmDeleteAccount = async () => {
    setShowDeleteConfirmDialog(false);
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      console.log('Deleting account for email:', userEmail);
      const response = await fetch(deleteAccountApiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userEmail,
          action: 'delete-account',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delete account response:', data);

      if (response.status === 207) {
        console.warn('Partial deletion occurred:', data.details);
        setDeleteError(`Partial deletion: ${data.details}. Your account may not be fully removed.`);
      }

      try {
        await Auth.signOut({ global: true });
      } catch (signOutError) {
        console.warn('Sign out failed after account deletion, proceeding with redirect:', signOutError.message);
      }

      localStorage.removeItem('userDataCache');
      navigate('/signin', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting account:', error.message);
      setDeleteError(`Failed to delete account: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGmailSignIn = async () => {
    console.log('handleGmailSignIn called with userEmail:', userEmail);
    if (!userEmail) {
      setGmailError('Authentication issue. Please sign in again.');
      navigate('/signin', { replace: true });
      return;
    }
    setGmailLoading(true);
    setGmailError(null);
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const response = await fetch(gmailApiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: idToken,
        },
        body: JSON.stringify({
          email: userEmail,
          action: 'authenticate',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      const gmailAuthResult = result.analysis?.gmailAuthResult;
      if (gmailAuthResult) {
        if (gmailAuthResult.needsAuth && gmailAuthResult.authUrl) {
          console.log('Redirecting to Google OAuth:', gmailAuthResult.authUrl);
          window.location.href = gmailAuthResult.authUrl;
        } else if (!gmailAuthResult.needsAuth && gmailAuthResult.isGmailConnected) {
          setIsGmailConnected(true);
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('Unexpected response: ' + (gmailAuthResult.message || 'No auth details'));
        }
      } else {
        throw new Error('Invalid response structure: missing gmailAuthResult');
      }
    } catch (error) {
      console.error('Gmail authentication error:', error.message);
      setGmailError(`Failed to connect to Gmail: ${error.message}`);
    } finally {
      setGmailLoading(false);
    }
  };

  const handleDisconnect = async (platform) => {
    if (!userEmail) {
      setDisconnectError('User email not found');
      return;
    }

    setDisconnectLoading((prev) => ({ ...prev, [platform]: true }));
    setDisconnectError(null);

    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      const response = await fetch(gmailDisconnectApiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userEmail,
          action: 'disconnect',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Disconnect platform response:', data);
      if (platform.toLowerCase() === 'gmail') {
        setIsGmailConnected(false);
      } else {
        throw new Error(`Unknown platform: ${platform}`);
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error.message);
      setDisconnectError(`Failed to disconnect ${platform}: ${error.message}`);
    } finally {
      setDisconnectLoading((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const handleEmailChange = () => {
    console.log('Email change requested for:', userEmail);
    // Add email change logic here (e.g., API call to update email)
  };

  const handlePasswordChange = () => {
    console.log('Password change requested with new password:', newPassword);
    // Add password change logic here (e.g., API call to update password)
    setNewPassword('');
  };

  if (!userEmail) {
    return (
      <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="taq-container">
        <TabBar
          activeTab={activeTab}
          firstName={firstName}
          lastName={lastName}
          handleUpgradeToPro={() => navigate('https://buy.stripe.com/6oUeVe72f0ZCaV23Vc8Ra0k')}
        />
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
        <main className="dashboard-content">
          <div className="settings-container">
            <div className="settings-header">
              <div className="settings-switcher" role="tablist">
                <button
                  className={`switcher-button ${activeSection === 'account' ? 'active' : ''}`}
                  onClick={() => setActiveSection('account')}
                  aria-selected={activeSection === 'account'}
                  role="tab"
                >
                  Account
                </button>
                <button
                  className={`switcher-button ${activeSection === 'subscription' ? 'active' : ''}`}
                  onClick={() => setActiveSection('subscription')}
                  aria-selected={activeSection === 'subscription'}
                  role="tab"
                >
                  Subscription & Billing
                </button>
              </div>
            </div>
            {activeSection === 'account' ? (
              <div className="account-section">
                <div className="account-columns">
                  <div className="account-column account-info">
                    <div className="account-info-content">
                      <div className="account-info-main">
                        <h3>BestWork Account Information</h3>
                        <div className="account-info-section">
                          <h4 className="account-info-title">Email</h4>
                          <div className="account-info-field">
                            <input
                              type="email"
                              className="account-info-input"
                              value={userEmail}
                              readOnly
                            />
                            <button
                              className="change-button"
                              onClick={handleEmailChange}
                            >
                              Change
                            </button>
                          </div>
                        </div>
                        <div className="account-info-section">
                          <h4 className="account-info-title">Password</h4>
                          <p className="account-info-subtitle">
                            To change your password, please fill out the field below. Your new password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special symbol.
                          </p>
                          <div className="account-info-field">
                            <input
                              type="password"
                              className="account-info-input"
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                              className="change-button"
                              onClick={handlePasswordChange}
                              disabled={!newPassword}
                            >
                              Change
                            </button>
                          </div>
                        </div>
                        <div className="account-info-section">
                          <h4 className="account-info-title">Name</h4>
                          <div className="account-info-field">
                            <input
                              type="text"
                              className="account-info-input"
                              value={firstName}
                              readOnly
                            />
                          </div>
                          <div className="account-info-field">
                            <input
                              type="text"
                              className="account-info-input"
                              value={lastName}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="account-divider"></div>
                  <div className="account-column gmail-integration">
                    <h3>Gmail Integration</h3>
                    <p className="gmail-subtitle">
                      Your Gmail credentials are fully encrypted and required to perform automated actions in the background. We do not have direct access and control over your Gmail account.
                    </p>
                    <div className="gmail-integration-card">
                      <div className="gmail-integration-header">
                        <span className="gmail-integration-label">Your current Gmail integration:</span>
                        <span className="gmail-integration-email">{userEmail}</span>
                      </div>
                      <div className={`integration-card ${isGmailConnected ? 'connected' : 'disconnected'}`}>
                        <div className="integration-header">
                          <FaGoogle className="integration-icon" />
                          <h4>Gmail</h4>
                        </div>
                        <div className="integration-status">
                          <span className={`status-dot ${isGmailConnected ? 'connected' : 'disconnected'}`}></span>
                          <span>{isGmailConnected ? 'Gmail is connected!' : 'Gmail not connected yet.'}</span>
                        </div>
                        {isGmailConnected ? (
                          <button
                            onClick={() => handleDisconnect('gmail')}
                            disabled={disconnectLoading.gmail}
                            className={`action-button disconnect-button ${disconnectLoading.gmail ? 'loading' : ''}`}
                          >
                            {disconnectLoading.gmail ? 'Disconnecting...' : 'Disconnect Gmail'}
                          </button>
                        ) : (
                          <button
                            onClick={handleGmailSignIn}
                            disabled={gmailLoading || !userEmail}
                            className={`action-button sign-in ${gmailLoading ? 'loading' : ''}`}
                          >
                            {gmailLoading ? 'Connecting...' : 'Sign in to Gmail'}
                          </button>
                        )}
                        {gmailError && <p className="error-text">{gmailError}</p>}
                      </div>
                      {disconnectError && <p className="error-text">{disconnectError}</p>}
                    </div>
                  </div>
                </div>
                <div className="signout-section">
                  <button
                    className="signout-button"
                    onClick={handleSignOutClick}
                    disabled={signOutLoading || deleteLoading}
                  >
                    {signOutLoading ? 'Signing Out...' : 'Sign Out'}
                  </button>
                  <button
                    className="signout-button"
                    onClick={handleDeleteAccountClick}
                    disabled={signOutLoading || deleteLoading}
                  >
                    {deleteLoading ? 'Deleting Account...' : 'Delete Account'}
                  </button>
                  {signOutError && <p className="error-text">{signOutError}</p>}
                  {deleteError && <p className="error-text">{deleteError}</p>}
                </div>
              </div>
            ) : (
              <div className="subscription-section">
                <h3>Subscription & Billing</h3>
                <div className="subscription-cards">
                  <div className="subscription-card pricing-card">
                    <div className="card-header">
                      <span className="card-label">Pricing</span>
                      <span className="card-value">Premium - Monthly</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Status</span>
                      <span className="status-active">Active</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Cost</span>
                      <div className="cost-group">
                        <span className="card-value">$9.00 / month</span>
                        <button className="info-button">i</button>
                      </div>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Active until</span>
                      <span className="card-value">June 14, 2025</span>
                    </div>
                    <button
                      className="subscription-action-button upgrade-button"
                      onClick={() => navigate('https://buy.stripe.com/6oUeVe72f0ZCaV23Vc8Ra0k')}
                    >
                      Upgrade
                    </button>
                  </div>
                  <div className="subscription-card payment-card">
                    <div className="card-header">
                      <span className="card-title">Payment Details</span>
                    </div>
                    <button className="subscription-action-button manage-payment-button">
                      Manage Payment
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showConfirmDialog && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <h3>Are you sure you want to sign out?</h3>
                  <div className="confirm-actions">
                    <button
                      className="confirm-button"
                      onClick={handleConfirmSignOut}
                      disabled={signOutLoading || deleteLoading}
                    >
                      {signOutLoading ? 'Signing Out...' : 'Yes, Sign Out'}
                    </button>
                    <button
                      className="cancel-button"
                      onClick={handleCancelSignOut}
                      disabled={signOutLoading || deleteLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showDeleteConfirmDialog && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <h3>Are you sure you want to delete your account?</h3>
                  <p>This action cannot be undone.</p>
                  <div className="confirm-actions">
                    <button
                      className="confirm-button"
                      onClick={handleConfirmDeleteAccount}
                      disabled={deleteLoading || signOutLoading}
                    >
                      {deleteLoading ? 'Deleting...' : 'Yes, Delete Account'}
                    </button>
                    <button
                      className="cancel-button"
                      onClick={handleCancelDeleteAccount}
                      disabled={deleteLoading || signOutLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

Settings.propTypes = {
  userEmail: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  isGmailConnected: PropTypes.bool,
  setIsGmailConnected: PropTypes.func,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
};

export default Settings;