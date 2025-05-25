import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GoogleAppDetails.css';

const GoogleAppDetails = () => {
  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bw-google-app-details">
      {/* Logo Header with Privacy Policy Link */}
      <div className="bw-google-app-details__header">
        <img
          src="/assets/blue_icon.jpeg"
          alt="Bestwork.ai Logo"
          className="bw-google-app-details__logo"
        />
        <a
          href="https://platform.bestwork.ai/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="link header-privacy-link"
        >
          Privacy Policy
        </a>
      </div>

      {/* Main Content */}
      <div className="bw-google-app-details__container">
        <div className="bw-google-app-details__content">
          <h1 className="bw-google-app-details__title">Bestwork.ai App Details</h1>

          {/* App Description */}
          <section className="section">
            <h2 className="section-title">About Bestwork.ai</h2>
            <p className="section-text">
              Bestwork.ai is a productivity platform designed to streamline your workflow by integrating seamlessly with your Google services. Our application helps professionals and teams manage their schedules, communications, and tasks more efficiently, saving time and boosting productivity.
            </p>
          </section>

          {/* App Functionality */}
          <section className="section">
            <h2 className="section-title">Core Features and Benefits</h2>
            <ul className="feature-list">
              <li>
                <strong>Automated Scheduling:</strong> Syncs with Google Calendar to schedule meetings based on your availability, reducing manual coordination.
              </li>
              <li>
                <strong>Smart Email Management:</strong> Integrates with Gmail to prioritize emails, suggest responses, and organize your inbox.
              </li>
              <li>
                <strong>Task Automation:</strong> Connects your calendar and email to create and manage tasks automatically, ensuring nothing falls through the cracks.
              </li>
              <li>
                <strong>Team Collaboration:</strong> Enables teams to share schedules and coordinate tasks effortlessly.
              </li>
            </ul>
          </section>

          {/* Google Data Usage */}
          <section className="section">
            <h2 className="section-title">How We Use Your Google Data</h2>
            <p className="section-text">
              Bestwork.ai accesses, uses, and stores Google user data to provide its core functionalities while adhering to strict privacy and security standards. Below, we outline the specific Google API scopes we request and how we use each data type:
            </p>
            <ul className="scope-list">
              <li>
                <strong>Gmail API (https://www.googleapis.com/auth/gmail.modify):</strong> We access your Gmail to read, modify, and send emails on your behalf. This enables smart email prioritization, automated responses, and inbox organization features.
              </li>
              <li>
                <strong>Userinfo Email API (https://www.googleapis.com/auth/userinfo.email):</strong> We access your email address to authenticate your identity and personalize your Bestwork.ai experience.
              </li>
            </ul>
            <p className="section-text compliance-statement">
              Bestwork.ai’s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          {/* Privacy Policy */}
          <section className="section">
            <h2 className="section-title">Our Commitment to Privacy</h2>
            <p className="section-text">
              Your privacy is our priority. For detailed information on how we collect, use, and protect your data, please review our{' '}
              <a
                href="https://platform.bestwork.ai/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                Privacy Policy
              </a>
              .
            </p>
          </section>

          {/* Standalone Privacy Policy Link */}
          <div className="bw-google-app-details__privacy-link">
            <a
              href="https://platform.bestwork.ai/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              Privacy Policy
            </a>
          </div>

          {/* Button Group */}
          <div className="bw-google-app-details__button-group">
            <Link to="/signup">
              <button className="bw-google-app-details__next-button">Sign Up</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bw-google-app-details__footer">
        <p>© 2025 Bestwork.ai</p>
        <a
          href="https://platform.bestwork.ai/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default GoogleAppDetails;