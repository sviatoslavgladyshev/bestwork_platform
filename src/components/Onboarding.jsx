import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth } from "aws-amplify";
import { FaGoogle } from "react-icons/fa";
import "./Onboarding.css";

const Onboarding = ({ userEmail, setIsGmailConnected }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Restore formData from localStorage or location.state
  useEffect(() => {
    const storedData = localStorage.getItem("onboardingData");
    const stateData = location.state?.formData;
    if (stateData) {
      setFormData(stateData);
      localStorage.setItem("onboardingData", JSON.stringify(stateData));
    } else if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, [location.state]);

  const validateStepOne = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    return newErrors;
  };

  const handleNextStepOne = () => {
    const validationErrors = validateStepOne();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      alert("Please fill in all required fields");
      return;
    }

    setStep(2);
  };

   const saveUserData = async () => {
    setIsLoading(true);

    let email = userEmail;
    if (!email) {
      try {
        const user = await Auth.currentAuthenticatedUser();
        email = user.attributes?.email || user.username;
        console.log("saveUserData - Fetched user email:", email);
        if (!email) {
          throw new Error("User email not found in authentication data");
        }
      } catch (err) {
        console.error("saveUserData - Auth error:", err);
        alert("Authentication issue. Please sign in again.");
        navigate("/signin", { replace: true });
        setIsLoading(false);
        return false;
      }
    }

    try {
      console.log("Calling save-data API with:", {
        email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        "https://xt6yqqk9h1.execute-api.us-east-1.amazonaws.com/dev/save-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            firstName: formData.firstName,
            lastName: formData.lastName,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json();
      console.log("save-data API response:", JSON.stringify(result, null, 2));
      if (!response.ok) {
        throw new Error(result.error || "Failed to save data");
      }

      return true; // Indicate success
    } catch (error) {
      console.error("save-data API error:", error.message);
      alert(
        error.message.includes("Missing required field: email")
          ? "Failed to save data: Email is missing. Please sign out and sign in again."
          : error.message.includes("aborted")
          ? "Request timed out. Please check your connection and try again."
          : `Failed to save your data: ${error.message}. Please try again.`
      );
      return false; // Indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleGmailSignIn = async () => {
    let email = userEmail;
    if (!email) {
      try {
        const user = await Auth.currentAuthenticatedUser();
        email = user.attributes?.email || user.username;
        console.log("handleGmailSignIn - Fetched user email:", email);
        if (!email) {
          throw new Error("User email not found in authentication data");
        }
      } catch (err) {
        console.error("handleGmailSignIn - Auth error:", err);
        setGmailError("Authentication issue. Please sign in again.");
        navigate("/signin", { replace: true });
        return;
      }
    }

    setGmailLoading(true);
    setGmailError(null);

    // Save data before Gmail authentication
    const saveSuccess = await saveUserData();
    if (!saveSuccess) {
      setGmailLoading(false);
      return;
    }

    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      console.log("Fetching Gmail auth API with idToken for email:", email);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
            action: "authenticate",
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json();
      console.log("Gmail auth API response:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.error || "Failed to authenticate with Gmail");
      }

      const gmailAuthResult = result.analysis?.gmailAuthResult;
      if (!gmailAuthResult) {
        throw new Error("Gmail authentication service is unavailable");
      }

      if (gmailAuthResult.needsAuth && gmailAuthResult.authUrl) {
        console.log("Redirecting to Google OAuth URL:", gmailAuthResult.authUrl);
        localStorage.setItem("inOnboarding", "true");
        localStorage.setItem("onboardingData", JSON.stringify(formData));
        window.location.href = gmailAuthResult.authUrl; // Use redirect instead of window.open
      } else if (!gmailAuthResult.needsAuth && gmailAuthResult.isGmailConnected) {
        console.log("Gmail already connected for", email);
        setIsGmailConnected(true);
        navigate("/dashboard", {
          state: { userEmail: email },
          replace: true,
        });
      } else {
        throw new Error("Unexpected authentication response");
      }
    } catch (error) {
      console.error("Gmail authentication error:", error.message);
      setGmailError(
        error.message.includes("unavailable") ||
        error.message.includes("Unexpected")
          ? "Gmail connection failed. Please try again or skip for now."
          : error.message.includes("aborted")
          ? "Request timed out. Please check your connection and try again."
          : `Failed to connect to Gmail: ${error.message}`
      );
      setGmailLoading(false);
    }
  };

  const handleSkip = async () => {
    const saveSuccess = await saveUserData();
    if (saveSuccess) {
      navigate("/dashboard", {
        state: { userEmail },
        replace: true,
      });
    }
  };

  return (
    <div className="bw-onboarding">
      <div className="bw-onboarding__logo-container">
        <img src="/assets/logo_blue_white.png" alt="Logo" className="bw-onboarding__logo" />
      </div>

      <div className="bw-onboarding__container">
        <div className="bw-onboarding__content">
          <div className="bw-onboarding__form">
            {step === 1 ? (
              <div className="question-content">
                <h1 className="question-heading">What is your first and last name?</h1>
                <div className="form-group" style={{ maxWidth: "300px", margin: "0 auto" }}>
                  <label className="input-label">First name</label>
                  <input
                    className="form-input"
                    type="text"
                    style={{
                      borderRadius: "10px",
                      marginBottom: "30px",
                      height: "40px",
                      border: "1px solid #25377B",
                    }}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isLoading}
                  />
                  {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}
                </div>
                <div className="form-group" style={{ maxWidth: "300px", margin: "0 auto" }}>
                  <label className="input-label">Last name</label>
                  <input
                    className="form-input"
                    type="text"
                    style={{
                      borderRadius: "10px",
                      height: "40px",
                      border: "1px solid #25377B",
                    }}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isLoading}
                  />
                  {errors.lastName && <p style={{ color: "red" }}>{errors.lastName}</p>}
                </div>
                <div className="bw-onboarding__button-group">
                  <button
                    className="bw-onboarding__next-button"
                    onClick={handleNextStepOne}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Next"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="question-content">
                <h1 className="question-heading">Connect your Gmail account</h1>
                <p style={{ textAlign: "center", marginBottom: "20px" }}>
                  Connect your Gmail to enable email features.
                </p>
                <div style={{ maxWidth: "300px", margin: "0 auto" }}>
                  <button
                    className="bw-onboarding__gmail-button"
                    onClick={handleGmailSignIn}
                    disabled={gmailLoading || isLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      backgroundColor: "#25377B",
                      color: "white",
                      border: "none",
                      cursor: gmailLoading || isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    <FaGoogle style={{ marginRight: "10px" }} />
                    {gmailLoading ? "Connecting..." : "Sign in with Gmail"}
                  </button>
                  {gmailError && <p style={{ color: "red", textAlign: "center" }}>{gmailError}</p>}
                </div>
                <div className="bw-onboarding__button-group" style={{ marginTop: "20px" }}>
                  <button
                    className="bw-onboarding__skip-button"
                    onClick={handleSkip}
                    disabled={isLoading || gmailLoading}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#25377B",
                      cursor: isLoading || gmailLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;