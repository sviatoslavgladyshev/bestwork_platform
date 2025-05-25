import React from 'react';
import { Link } from 'react-router-dom';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="bw-privacy">
      <div className="bw-privacy__container">
        <div className="bw-privacy__content">
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

          <div className="bw-privacy__back-button">
            <Link to="/signin">
              <button>Back to Sign In</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;