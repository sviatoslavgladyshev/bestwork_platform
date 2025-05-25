import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../aws-exports';
import './ForgotPassword.css';

Amplify.configure(awsExports);

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationDigits, setVerificationDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const navigate = useNavigate();
  
  const digitRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null)
  ];

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validatePassword = (password) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleDigitChange = (index, value, isPaste = false) => {
    if (isPaste) {
      const pastedValue = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...verificationDigits];
      
      for (let i = 0; i < pastedValue.length && i < 6; i++) {
        newDigits[i] = pastedValue[i];
      }
      
      setVerificationDigits(newDigits);
      const focusIndex = Math.min(pastedValue.length, 5);
      digitRefs[focusIndex].current?.focus();
    } else {
      if (!/^\d*$/.test(value)) return;

      const newDigits = [...verificationDigits];
      newDigits[index] = value;
      setVerificationDigits(newDigits);

      if (value !== '' && index < 5) {
        digitRefs[index + 1].current?.focus();
      }
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && verificationDigits[index] === '' && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  };

  const requestPasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await Auth.forgotPassword(email);
      setStep(2);
      setTimer(60);
      console.log("Password reset code sent to:", email);
    } catch (err) {
      console.error("Error requesting password reset:", err);
      setError(err.message || "Error requesting password reset");
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationCode = async () => {
    try {
      await Auth.forgotPassword(email);
      setTimer(60);
      console.log("New verification code sent to:", email);
    } catch (err) {
      console.error("Error resending code:", err);
      setError(err.message || "Error resending code");
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    if (!passwordMatch || !Object.values(passwordRequirements).every(Boolean)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const code = verificationDigits.join('');
      await Auth.forgotPasswordSubmit(email, code, newPassword);
      console.log("Password reset successful");
      navigate('/signin');
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err.message || "Error resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bw-forgot-password">
      <div className="bw-forgot-password__logo-container">
        <img 
          src="/assets/logo_blue_white.png" 
          alt="BestWork Logo" 
          className="bw-forgot-password__logo"
        />
      </div>

      <div className="bw-forgot-password__progress-container">
        <div className="bw-forgot-password__progress-bar">
          <div
            className="bw-forgot-password__progress-bar-filled"
            style={{ width: step === 1 ? "50%" : "100%" }}
          ></div>
        </div>
      </div>

      <div className="bw-forgot-password__container">
        {step === 1 ? (
          <>
            <h1 className="bw-forgot-password__title">Reset your password</h1>
            <form className="bw-forgot-password__form" onSubmit={requestPasswordReset}>
              <div className="bw-forgot-password__field-group">
                <label className="bw-forgot-password__label">Email</label>
                <input
                  type="email"
                  className="bw-forgot-password__input"
                  placeholder="example@work.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <div className="bw-forgot-password__error">{error}</div>}

              <button
                type="submit"
                className="bw-forgot-password__button"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send reset code"}
              </button>

              <div className="bw-forgot-password__back-link">
                Remember your password? <a href="/signin">Sign in</a>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className="bw-forgot-password__title">Create new password</h1>
            <form className="bw-forgot-password__form" onSubmit={submitNewPassword}>
              <div className="bw-forgot-password__field-group">
                <label className="bw-forgot-password__label">Verification code</label>
                <div className="bw-forgot-password__verification-digits">
                  {verificationDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={digitRefs[index]}
                      type="text"
                      className="bw-forgot-password__digit-input"
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData.getData('text');
                        handleDigitChange(index, pastedData, true);
                      }}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      required
                    />
                  ))}
                </div>
                
                <div className="bw-forgot-password__resend-wrapper">
                  {timer > 0 ? (
                    <span className="bw-forgot-password__timer">
                      Didn't get the code? Another one can be sent in {timer} seconds
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="bw-forgot-password__resend-button"
                      onClick={resendConfirmationCode}
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>

              <div className="bw-forgot-password__field-group">
                <label className="bw-forgot-password__label">New Password</label>
                <div className="bw-forgot-password__password-container">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    className="bw-forgot-password__input"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => {
                      const newPass = e.target.value;
                      setNewPassword(newPass);
                      setPasswordTouched(true);
                      validatePassword(newPass);
                      if (confirmPasswordTouched) {
                        setPasswordMatch(newPass === confirmNewPassword);
                      }
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="bw-forgot-password__password-toggle"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="bw-forgot-password__field-group">
                <label className="bw-forgot-password__label">Confirm New Password</label>
                <div className="bw-forgot-password__password-container">
                  <input
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    className="bw-forgot-password__input"
                    placeholder="********"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setConfirmPasswordTouched(true);
                      setPasswordMatch(e.target.value === newPassword);
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="bw-forgot-password__password-toggle"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  >
                    {isConfirmPasswordVisible ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {passwordTouched && (
                <div className="bw-forgot-password__password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li className={passwordRequirements.length ? "valid" : ""}>
                      At least 8 characters
                    </li>
                    <li className={passwordRequirements.uppercase ? "valid" : ""}>
                      At least one uppercase letter
                    </li>
                    <li className={passwordRequirements.number ? "valid" : ""}>
                      At least one number
                    </li>
                    <li className={passwordRequirements.specialChar ? "valid" : ""}>
                      At least one special character
                    </li>
                  </ul>
                </div>
              )}

              {!passwordMatch && confirmPasswordTouched && (
                <div className="bw-forgot-password__error">Passwords do not match.</div>
              )}

              {error && <div className="bw-forgot-password__error">{error}</div>}

              <button
                type="submit"
                className="bw-forgot-password__button"
                disabled={isLoading || !passwordMatch || !Object.values(passwordRequirements).every(Boolean)}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;