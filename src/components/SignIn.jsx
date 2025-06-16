import React, { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import { useNavigate, useLocation } from 'react-router-dom';
import awsExports from '../aws-exports';
import './SignIn.css';

Amplify.configure(awsExports);

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('SignIn: Component mounted, location state:', location.state);
    if (location.state?.error) {
      setError(location.state.error);
    } else if (location.state?.sessionExpired) {
      setError('Your session has expired. Please sign in again.');
    } else if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const signIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log("Attempting to sign in user:", email);
      const signInResponse = await Auth.signIn(email, password);
      console.log("✅ Sign in successful. User details:", {
        username: signInResponse.username,
        attributes: signInResponse.attributes,
        authenticationFlowType: signInResponse.authenticationFlowType,
      });

      localStorage.removeItem('authData');
      localStorage.removeItem('inAuth');

      console.log('Navigating to /dashboard');
      navigate('/dashboard', {
        state: { userEmail: signInResponse.attributes?.email || email },
        replace: true,
      });
    } catch (error) {
      console.error("❌ Sign in error:", {
        error: error.message,
        code: error.code,
        name: error.name,
      });
      setError(error.message || 'Error signing in');
    } finally {
      setIsLoading(false);
    }
  };

  const goToForgotPassword = () => {
    console.log('Navigating to /forgot-password');
    navigate('/forgot-password');
  };

  const openPrivacyModal = (e) => {
    e.preventDefault();
    setIsPrivacyModalOpen(true);
  };

  const closePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
  };

  const openTermsModal = (e) => {
    e.preventDefault();
    setIsTermsModalOpen(true);
  };

  const closeTermsModal = () => {
    setIsTermsModalOpen(false);
  };

  return (
    <div className="bw-signin">
      <div className="bw-signin__logo-container">
        <img 
          src="/assets/logo_colors_3d.png" 
          alt="BestWork Logo" 
          className="bw-signin__logo"
        />
      </div>

      <div className="bw-signin__container">
        <h1 className="bw-signin__title">Sign in to BestWork</h1>
        
        <form className="bw-signin__form" onSubmit={signIn}>
          <div className="bw-signin__field-group">
            <label className="bw-signin__label">Email</label>
            <div className="bw-signin__input-wrapper">
              <input
                className="bw-signin__input bw-signin__input--gradient"
                type="email"
                placeholder="example@work.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bw-signin__field-group">
            <label className="bw-signin__label">Password</label>
            <div className="bw-signin__password-container">
              <div className="bw-signin__input-wrapper">
                <input
                  className="bw-signin__input bw-signin__input--gradient"
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                className="bw-signin__password-toggle"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                type="button"
              >
                {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="bw-signin__forgot-button"
            onClick={goToForgotPassword}
          >
            Forgot Password?
          </button>

          {error && <div className="bw-signin__error">{error}</div>}
          {successMessage && <div className="bw-signin__success">{successMessage}</div>}

          <div className="bw-signin__button-group">
            <button
              type="button"
              className="bw-signin__create-button"
              onClick={() => navigate('/welcome')}
            >
              Create Account
            </button>
            <button
              type="submit"
              className="bw-signin__submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="bw-signin__terms">
            By using BestWork you agree to the{' '}
            <a href="/terms" onClick={openTermsModal}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" onClick={openPrivacyModal}>Privacy Policy</a>
          </div>
        </form>
      </div>

      {isPrivacyModalOpen && (
        <div className="bw-signin__modal-overlay">
          <div className="bw-signin__modal">
            <button 
              className="bw-signin__modal-close" 
              onClick={closePrivacyModal}
            >
              ×
            </button>
            <div className="bw-signin__modal-content">
              <h2>Privacy Policy</h2>
              <p><strong>Effective Date:</strong> March 11, 2025</p>
              <p><strong>Last Updated:</strong> March 11, 2025</p>
              <p>LevelUp Innovations Inc., doing business as BestWork ("BestWork," "we," "us," or "our"), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our software application (the "Service"). By accessing or using the Service, you agree to the terms of this Privacy Policy. If you do not agree with this policy, please do not use the Service.</p>
              <h3>1. Information We Collect</h3>
              <p>We may collect the following types of information:</p>
              <h4>a. Personal Information</h4>
              <ul>
                <li><strong>Contact Information:</strong> Name, email address, phone number, or mailing address provided when you sign up for the Service or contact us.</li>
                <li><strong>Account Information:</strong> Username, password, and other credentials used to access the Service.</li>
                <li><strong>Payment Information:</strong> Billing details, such as credit card numbers or other payment methods, processed through our third-party payment processors.</li>
              </ul>
              <h4>b. Usage Data</h4>
              <ul>
                <li><strong>Technical Information:</strong> IP address, browser type, operating system, device information, and other technical data collected when you interact with the Service.</li>
                <li><strong>Service Usage:</strong> Information about how you use the Service, including features accessed, time spent, and interactions within the platform.</li>
              </ul>
              <h4>c. User-Provided Content</h4>
              <p>Any data, files, or content you upload, input, or share while using the Service.</p>
              <h4>d. Cookies and Tracking Technologies</h4>
              <p>We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can manage your cookie preferences through your browser settings.</p>
              <h3>2. How We Use Your Information</h3>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li>To provide, maintain, and improve the Service.</li>
                <li>To process transactions and manage your account.</li>
                <li>To communicate with you, including sending service-related announcements, updates, or promotional offers (you may opt out of marketing communications).</li>
                <li>To analyze usage trends and optimize the Service’s performance.</li>
                <li>To comply with legal obligations and protect the rights, safety, or property of BestWork, our users, or others.</li>
              </ul>
              <h3>3. How We Share Your Information</h3>
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              <ul>
                <li><strong>Service Providers:</strong> With trusted third-party vendors who assist us in operating the Service (e.g., hosting providers, payment processors, or analytics services), bound by confidentiality obligations.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation, or to protect against fraud or illegal activity.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, where your information may be transferred as part of the transaction.</li>
              </ul>
              <h3>4. Data Security</h3>
              <p>We implement reasonable technical and organizational measures to protect your information from unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee the absolute security of your data.</p>
              <h3>5. Your Choices and Rights</h3>
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request that we correct inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> Request that we delete your personal data, subject to legal exceptions.</li>
                <li><strong>Opt-Out:</strong> Opt out of marketing communications or certain data processing activities.</li>
              </ul>
              <p>To exercise these rights, please contact us at <a href="mailto:britt@bestwork.ai">britt@bestwork.ai</a>. We will respond to your request in accordance with applicable laws.</p>
              <h3>6. Data Retention</h3>
              <p>We retain your information for as long as necessary to provide the Service, fulfill the purposes outlined in this Privacy Policy, or comply with legal obligations. When your data is no longer needed, we will securely delete or anonymize it.</p>
              <h3>7. Third-Party Links</h3>
              <p>The Service may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third parties. We encourage you to review their privacy policies before interacting with them.</p>
              <h3>8. Children’s Privacy</h3>
              <p>The Service is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we learn that such data has been collected, we will take steps to delete it promptly.</p>
              <h3>9. International Data Transfers</h3>
              <p>BestWork is based in the United States. If you access the Service from outside this jurisdiction, your information may be transferred to and processed in the United States. We take steps to ensure that such transfers comply with applicable data protection laws.</p>
              <h3>10. Changes to This Privacy Policy</h3>
              <p>We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised "Last Updated" date. We encourage you to review this policy periodically. Your continued use of the Service after changes are posted constitutes your acceptance of the updated policy.</p>
              <h3>11. Contact Us</h3>
              <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
              <p>
                LevelUp Innovations Inc.<br />
                Doing Business As: BestWork<br />
                8 The Green, Suite B<br />
                Dover, DE, 19901<br />
                Email: <a href="mailto:britt@bestwork.ai">britt@bestwork.ai</a><br />
                Phone: 917-974-2908
              </p>
            </div>
          </div>
        </div>
      )}

      {isTermsModalOpen && (
        <div className="bw-signin__modal-overlay">
          <div className="bw-signin__modal">
            <button 
              className="bw-signin__modal-close" 
              onClick={closeTermsModal}
            >
              ×
            </button>
            <div className="bw-signin__modal-content">
              <h2>Terms of Service</h2>
              <p><strong>Effective Date:</strong> March 11, 2025</p>
              <p><strong>Last Updated:</strong> March 11, 2025</p>
              <p>LevelUp Innovations Inc., doing business as BestWork ("BestWork," "we," "us," or "our"), provides its software application (the "Service") subject to the following Terms of Service ("Terms"). These Terms govern your access to and use of the Service. By accessing or using the Service, you agree to be bound by these Terms. If you do not agree with these Terms, you must not use the Service.</p>
              <h3>1. Eligibility</h3>
              <p>You must be at least 13 years of age to use the Service. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.</p>
              <h3>2. Account Registration</h3>
              <p>To access certain features of the Service, you must create an account. You agree to:</p>
              <ul>
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the security of your account credentials and promptly notify us of any unauthorized use.</li>
                <li>Be responsible for all activities that occur under your account.</li>
              </ul>
              <h3>3. Use of the Service</h3>
              <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You shall not:</p>
              <ul>
                <li>Use the Service to engage in any illegal or unauthorized activity.</li>
                <li>Attempt to gain unauthorized access to any portion of the Service or related systems.</li>
                <li>Upload or transmit any harmful code, viruses, or content that infringes on the rights of others.</li>
                <li>Interfere with or disrupt the operation of the Service.</li>
              </ul>
              <h3>4. User Content</h3>
              <p>You retain ownership of any content you upload, input, or share through the Service ("User Content"). By providing User Content, you grant BestWork a non-exclusive, worldwide, royalty-free license to use, store, reproduce, and display such content solely to provide and improve the Service. You represent that your User Content does not violate any third-party rights or applicable laws.</p>
              <h3>5. Intellectual Property</h3>
              <p>The Service, including its design, text, graphics, software, and other content (excluding User Content), is owned by BestWork or its licensors and protected by intellectual property laws. You may not reproduce, modify, distribute, or create derivative works of the Service without our prior written consent.</p>
              <h3>6. Payment and Subscription</h3>
              <p>Certain features of the Service may require payment. You agree to provide accurate payment information and authorize us to charge the applicable fees through our third-party payment processors. All fees are non-refundable unless otherwise stated. We may modify subscription fees with prior notice.</p>
              <h3>7. Termination</h3>
              <p>We may suspend or terminate your access to the Service at our discretion, with or without notice, for reasons including but not limited to violation of these Terms. You may terminate your account at any time by contacting us. Upon termination, your right to use the Service ceases, but these Terms’ provisions that by their nature should survive (e.g., intellectual property, limitation of liability) will remain in effect.</p>
              <h3>8. Disclaimer of Warranties</h3>
              <p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee that the Service will be uninterrupted, error-free, or secure.</p>
              <h3>9. Limitation of Liability</h3>
              <p>To the fullest extent permitted by law, BestWork and its affiliates, officers, directors, employees, or agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Service. Our total liability to you for any claim will not exceed the amount you paid to us for the Service in the preceding 12 months.</p>
              <h3>10. Indemnification</h3>
              <p>You agree to indemnify and hold harmless BestWork and its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, or expenses (including reasonable attorneys’ fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.</p>
              <h3>11. Governing Law and Dispute Resolution</h3>
              <p>These Terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of laws principles. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in Dover, Delaware, in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive relief in a court of competent jurisdiction.</p>
              <h3>12. Changes to These Terms</h3>
              <p>We may update these Terms from time to time. The updated version will be posted on this page with a revised "Last Updated" date. Your continued use of the Service after changes are posted constitutes your acceptance of the updated Terms.</p>
              <h3>13. Contact Us</h3>
              <p>If you have questions or concerns about these Terms, please contact us at:</p>
              <p>
                LevelUp Innovations Inc.<br />
                Doing Business As: BestWork<br />
                8 The Green, Suite B<br />
                Dover, DE, 19901<br />
                Email: <a href="mailto:britt@bestwork.ai">britt@bestwork.ai</a><br />
                Phone: 917-974-2908
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;