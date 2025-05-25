import React from 'react';
import { Link } from 'react-router-dom';
import './Terms.css';

const Terms = () => {
  return (
    <div className="bw-terms">
      <div className="bw-terms__container">
        <div className="bw-terms__content">
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

          <div className="bw-terms__back-button">
            <Link to="/signin">
              <button>Back to Sign In</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;