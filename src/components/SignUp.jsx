// import React, { useState, useEffect } from 'react';
// import { Amplify, Auth } from 'aws-amplify';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { FaGoogle } from 'react-icons/fa';
// import { motion, AnimatePresence } from 'framer-motion';
// import awsExports from '../aws-exports';
// import './SignUp.css';

// Amplify.configure(awsExports);

// const SignUp = ({ setIsGmailConnected = () => {} }) => {
//   const [step, setStep] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [timer, setTimer] = useState(0);
//   const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
//   const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
//   const [gmailLoading, setGmailLoading] = useState(false);
//   const [gmailError, setGmailError] = useState(null);

//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmationCode: '',
//     username: '',
//     firstName: '',
//     lastName: '',
//   });

//   const [verificationDigits, setVerificationDigits] = useState(['', '', '', '', '', '']);
//   const digitRefs = [
//     React.useRef(null),
//     React.useRef(null),
//     React.useRef(null),
//     React.useRef(null),
//     React.useRef(null),
//     React.useRef(null),
//   ];

//   const [passwordTouched, setPasswordTouched] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});

//   const [passwordRequirements, setPasswordRequirements] = useState({
//     length: false,
//     uppercase: false,
//     number: false,
//     specialChar: false,
//   });

//   const navigate = useNavigate();
//   const location = useLocation();
//   const totalSteps = 4;
//   const progressPercentage = (step / totalSteps) * 100;

//   useEffect(() => {
//     let interval = null;
//     if (timer > 0) {
//       interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(interval);
//   }, [timer]);

//   useEffect(() => {
//     const storedData = localStorage.getItem('authData');
//     const stateData = location.state?.formData;
//     if (stateData) {
//       setFormData((prev) => ({ ...prev, ...stateData }));
//       localStorage.setItem('authData', JSON.stringify(stateData));
//     } else if (storedData) {
//       setFormData((prev) => ({ ...prev, ...JSON.parse(storedData) }));
//     }
//   }, [location.state]);

//   const validatePassword = (password) => {
//     setPasswordRequirements({
//       length: password.length >= 8,
//       uppercase: /[A-Z]/.test(password),
//       number: /\d/.test(password),
//       specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
//     });
//   };

//   const generateUsername = (email) => {
//     return email
//       .split('@')[0]
//       .replace(/[^a-zA-Z0-9]/g, '')
//       .toLowerCase();
//   };

//   const handleDigitChange = (index, value, isPaste = false) => {
//     if (isPaste) {
//       const pastedValue = value.replace(/\D/g, '').slice(0, 6);
//       const newDigits = [...verificationDigits];
//       for (let i = 0; i < pastedValue.length && i < 6; i++) {
//         newDigits[i] = pastedValue[i];
//       }
//       setVerificationDigits(newDigits);
//       setFormData((prev) => ({
//         ...prev,
//         confirmationCode: newDigits.join(''),
//       }));
//       const focusIndex = Math.min(pastedValue.length, 5);
//       digitRefs[focusIndex].current?.focus();
//     } else {
//       if (!/^\d*$/.test(value)) return;
//       const newDigits = [...verificationDigits];
//       newDigits[index] = value;
//       setVerificationDigits(newDigits);
//       setFormData((prev) => ({
//         ...prev,
//         confirmationCode: newDigits.join(''),
//       }));
//       if (value !== '' && index < 5) {
//         digitRefs[index + 1].current?.focus();
//       }
//     }
//   };

//   const handleDigitKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && verificationDigits[index] === '' && index > 0) {
//       digitRefs[index - 1].current?.focus();
//     }
//   };

//   const validateNameStep = () => {
//     const newErrors = {};
//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
//     return newErrors;
//   };

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     if (!Object.values(passwordRequirements).every(Boolean)) {
//       return;
//     }
//     setError('');
//     setIsLoading(true);

//     try {
//       const username = generateUsername(formData.email);
//       await Auth.signUp({
//         username,
//         password: formData.password,
//         attributes: { email: formData.email },
//       });
//       setFormData((prev) => ({ ...prev, username }));
//       setStep(2);
//       setTimer(60);
//     } catch (err) {
//       if (err.code === 'UsernameExistsException') {
//         try {
//           const username = generateUsername(formData.email);
//           await Auth.resendSignUp(username);
//           setFormData((prev) => ({ ...prev, username }));
//           setStep(2);
//           setTimer(60);
//         } catch (resendErr) {
//           setError(resendErr.code === 'InvalidParameterException' 
//             ? 'Account already exists. Please sign in.' 
//             : resendErr.message || 'Error resending code');
//         }
//       } else {
//         setError(err.message || 'Error during sign up');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVerification = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       await Auth.confirmSignUp(formData.username, formData.confirmationCode);
//       await Auth.signIn(formData.email, formData.password);
//       const storedTemplateData = localStorage.getItem('templateData');
//       const storedPlan = localStorage.getItem('selectedPlan');
//       if (storedTemplateData) {
//         try {
//           const templateData = JSON.parse(storedTemplateData);
//           const payload = {
//             userEmail: formData.email,
//             selectedPlan: storedPlan || 'starter',
//             ...templateData,
//           };
//           const response = await fetch(
//             'https://2ofjdl14kg.execute-api.us-east-1.amazonaws.com/prod/publish',
//             {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(payload),
//             }
//           );
//           if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             throw new Error(errorData.error || `Failed to publish template (Status: ${response.status})`);
//           }
//           localStorage.removeItem('templateData');
//           localStorage.removeItem('selectedPlan');
//         } catch (publishErr) {
//           setError(publishErr.message || 'Failed to publish template.');
//         }
//       }
//       setStep(3);
//     } catch (err) {
//       setError(err.code === 'NotAuthorizedException' 
//         ? 'Invalid password. Please try again or reset your password.' 
//         : err.message || 'Error confirming sign up or signing in');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendConfirmationCode = async () => {
//     try {
//       await Auth.resendSignUp(formData.username);
//       setTimer(60);
//     } catch (err) {
//       setError(err.message || 'Error resending code');
//     }
//   };

//   const handleNameStep = () => {
//     const validationErrors = validateNameStep();
//     setErrors(validationErrors);
//     if (Object.keys(validationErrors).length > 0) {
//       alert('Please fill in all required fields');
//       return;
//     }
//     localStorage.setItem('authData', JSON.stringify(formData));
//     setStep(4);
//   };

//   const saveUserData = async () => {
//     setIsLoading(true);
//     let email = formData.email;
//     try {
//       const user = await Auth.currentAuthenticatedUser();
//       email = user.attributes?.email || user.username;
//       if (!email) {
//         throw new Error('User email not found in authentication data');
//       }
//     } catch (err) {
//       setError('Authentication issue. Please sign in again.');
//       navigate('/signin', { replace: true });
//       setIsLoading(false);
//       return false;
//     }

//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 10000);
//       const response = await fetch(
//         'https://xt6yqqk9h1.execute-api.us-east-1.amazonaws.com/dev/save-data',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             email,
//             firstName: formData.firstName,
//             lastName: formData.lastName,
//           }),
//           signal: controller.signal,
//         }
//       );
//       clearTimeout(timeoutId);
//       const result = await response.json();
//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to save data');
//       }
//       return true;
//     } catch (error) {
//       setError(
//         error.message.includes('Missing required field: email')
//           ? 'Failed to save data: Email is missing.'
//           : error.message.includes('aborted')
//           ? 'Request timed out.'
//           : `Failed to save your data: ${error.message}.`
//       );
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGmailSignIn = async () => {
//     let email = formData.email;
//     if (!email) {
//       try {
//         const user = await Auth.currentAuthenticatedUser();
//         email = user.attributes?.email || user.username;
//         if (!email) {
//           throw new Error('User email not found in authentication data');
//         }
//       } catch (err) {
//         setGmailError('Authentication issue. Please sign in again.');
//         navigate('/signin', { replace: true });
//         return;
//       }
//     }

//     setGmailLoading(true);
//     setGmailError(null);

//     const saveSuccess = await saveUserData();
//     if (!saveSuccess) {
//       setGmailLoading(false);
//       return;
//     }

//     try {
//       const session = await Auth.currentSession();
//       const idToken = session.getIdToken().getJwtToken();
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 10000);
//       const response = await fetch(
//         'https://39ormpmfi2.execute-api.us-east-1.amazonaws.com/dev/gmail-auth',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: idToken,
//           },
//           body: JSON.stringify({ email, action: 'authenticate' }),
//           signal: controller.signal,
//         }
//       );
//       clearTimeout(timeoutId);
//       const result = await response.json();
//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to authenticate with Gmail');
//       }
//       const gmailAuthResult = result.analysis?.gmailAuthResult;
//       if (!gmailAuthResult) {
//         throw new Error('Gmail authentication service is unavailable');
//       }
//       if (gmailAuthResult.needsAuth && gmailAuthResult.authUrl) {
//         localStorage.setItem('inAuth', 'true');
//         localStorage.setItem('authData', JSON.stringify(formData));
//         window.location.href = gmailAuthResult.authUrl;
//       } else if (!gmailAuthResult.needsAuth && gmailAuthResult.isGmailConnected) {
//         setIsGmailConnected(true);
//         localStorage.removeItem('authData');
//         localStorage.removeItem('inAuth');
//         navigate('/dashboard', { state: { userEmail: email }, replace: true });
//       } else {
//         throw new Error('Unexpected authentication response');
//       }
//     } catch (error) {
//       setGmailError(
//         error.message.includes('unavailable') || error.message.includes('Unexpected')
//           ? 'Gmail connection failed.'
//           : error.message.includes('aborted')
//           ? 'Request timed out.'
//           : `Failed to connect to Gmail: ${error.message}`
//       );
//       setGmailLoading(false);
//     }
//   };

//   const handleSkip = async () => {
//     const saveSuccess = await saveUserData();
//     if (saveSuccess) {
//       localStorage.removeItem('authData');
//       navigate('/dashboard', { state: { userEmail: formData.email }, replace: true });
//     }
//   };

//   const handleBack = () => {
//     if (step > 1) {
//       setStep(step - 1);
//       setError('');
//       setVerificationDigits(['', '', '', '', '', '']);
//     }
//   };

//   const openPrivacyModal = (e) => {
//     e.preventDefault();
//     setIsPrivacyModalOpen(true);
//     setIsTermsModalOpen(false);
//   };

//   const closePrivacyModal = () => setIsPrivacyModalOpen(false);

//   const openTermsModal = (e) => {
//     e.preventDefault();
//     setIsTermsModalOpen(true);
//     setIsPrivacyModalOpen(false);
//   };

//   const closeTermsModal = () => setIsTermsModalOpen(false);

//   // Animation Variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//     exit: { opacity: 0, transition: { duration: 0.3 } },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         ease: 'easeOut',
//       },
//     },
//     exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
//   };

//   const modalVariants = {
//     hidden: { opacity: 0, scale: 0.8 },
//     visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
//     exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
//   };

//   const modalOverlayVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { duration: 0.3 } },
//     exit: { opacity: 0, transition: { duration: 0.3 } },
//   };

//   return (
//     <div className="bw-auth">
//       <motion.div
//         className="bw-auth__logo-container"
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <motion.img
//           src="/assets/logo_colors_3d.png"
//           alt="BestWork Logo"
//           className="bw-auth__logo"
//           variants={itemVariants}
//         />
//       </motion.div>

//       <motion.div
//         className="bw-auth__progress-container"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.2 }}
//       >
//         <motion.div className="bw-auth__progress-bar" variants={itemVariants}>
//           <motion.div
//             className="bw-auth__progress-bar-filled"
//             style={{ width: `${progressPercentage}%` }}
//             initial={{ width: 0 }}
//             animate={{ width: `${progressPercentage}%` }}
//             transition={{ duration: 0.5, ease: 'easeOut' }}
//           ></motion.div>
//         </motion.div>
//       </motion.div>

//       <div className="bw-auth__container">
//         <div className="bw-auth__content">
//           <AnimatePresence mode="wait">
//             {step === 1 ? (
//               <motion.form
//                 key="step1"
//                 className="bw-auth__form step1"
//                 onSubmit={handleSignUp}
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 exit="exit"
//               >
//                 <motion.h1 className="bw-auth__title" variants={itemVariants}>
//                   Sign up for BestWork
//                 </motion.h1>
//                 <motion.div variants={itemVariants}>
//                   <div className="bw-auth__field-group">
//                     <label className="bw-auth__label">Email</label>
//                     <motion.div className="bw-auth__input-wrapper" variants={itemVariants}>
//                       <input
//                         type="email"
//                         className="bw-auth__input bw-auth__input--gradient"
//                         placeholder="example@work.com"
//                         value={formData.email}
//                         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                         required
//                       />
//                     </motion.div>
//                   </div>
//                   <div className="bw-auth__field-group">
//                     <label className="bw-auth__label">Password</label>
//                     <motion.div variants={itemVariants}>
//                       <div className="bw-auth__password-container">
//                         <div className="bw-auth__input-wrapper">
//                           <input
//                             type={showPassword ? 'text' : 'password'}
//                             className="bw-auth__input bw-auth__input--gradient"
//                             placeholder="********"
//                             value={formData.password}
//                             onChange={(e) => {
//                               const newPassword = e.target.value;
//                               setFormData({ ...formData, password: newPassword });
//                               setPasswordTouched(true);
//                               validatePassword(newPassword);
//                             }}
//                             required
//                           />
//                         </div>
//                         <button
//                           className="bw-auth__password-toggle"
//                           onClick={() => setShowPassword(!showPassword)}
//                           type="button"
//                         >
//                           {showPassword ? '👁️' : '👁️‍🗨'}
//                         </button>
//                       </div>
//                     </motion.div>
//                   </div>
//                 </motion.div>

//                 {passwordTouched && (
//                   <motion.div className="bw-auth__password-requirements" variants={itemVariants}>
//                     <motion.h4 variants={itemVariants}>Password Requirements:</motion.h4>
//                     <motion.ul variants={itemVariants}>
//                       <motion.li
//                         className={passwordRequirements.length ? 'valid' : ''}
//                         variants={itemVariants}
//                       >
//                         At least 8 characters
//                       </motion.li>
//                       <motion.li
//                         className={passwordRequirements.uppercase ? 'valid' : ''}
//                         variants={itemVariants}
//                       >
//                         At least one uppercase letter
//                       </motion.li>
//                       <motion.li
//                         className={passwordRequirements.number ? 'valid' : ''}
//                         variants={itemVariants}
//                       >
//                         At least one number
//                       </motion.li>
//                       <motion.li
//                         className={passwordRequirements.specialChar ? 'valid' : ''}
//                         variants={itemVariants}
//                       >
//                         At least one special character
//                       </motion.li>
//                     </motion.ul>
//                   </motion.div>
//                 )}

//                 {error && (
//                   <motion.div className="bw-auth__error" variants={itemVariants}>
//                     {error}
//                   </motion.div>
//                 )}

//                 <motion.button
//                   className="bw-auth__button"
//                   type="submit"
//                   disabled={isLoading || !Object.values(passwordRequirements).every(Boolean)}
//                   variants={itemVariants}
//                 >
//                   {isLoading ? 'Creating...' : 'Create Account'}
//                 </motion.button>

//                 <motion.div className="bw-auth__signin-link" variants={itemVariants}>
//                   Already have an account?{' '}
//                   <motion.a href="/signin" variants={itemVariants}>
//                     Sign in
//                   </motion.a>
//                 </motion.div>
//               </motion.form>
//             ) : step === 2 ? (
//               <motion.form
//                 key="step2"
//                 className="bw-auth__form step2"
//                 onSubmit={handleVerification}
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 exit="exit"
//               >
//                 <motion.h2 className="bw-auth__verification-title" variants={itemVariants}>
//                   Enter the verification code sent to your email
//                 </motion.h2>

//                 <motion.div className="bw-auth__field-group" variants={itemVariants}>
//                   <motion.label className="bw-auth__label" variants={itemVariants}>
//                     Verification code
//                   </motion.label>
//                   <motion.div className="bw-auth__verification-digits" variants={itemVariants}>
//                     {verificationDigits.map((digit, index) => (
//                       <motion.div key={index} className="bw-auth__digit-wrapper" variants={itemVariants}>
//                         <input
//                           ref={digitRefs[index]}
//                           type="text"
//                           className="bw-auth__digit bw-auth__input--gradient"
//                           value={digit}
//                           maxLength={1}
//                           onChange={(e) => handleDigitChange(index, e.target.value)}
//                           onPaste={(e) => {
//                             e.preventDefault();
//                             const pastedData = e.clipboardData.getData('text');
//                             handleDigitChange(index, pastedData, true);
//                           }}
//                           onKeyDown={(e) => handleDigitKeyDown(index, e)}
//                           required
//                         />
//                       </motion.div>
//                     ))}
//                   </motion.div>

//                   <motion.div className="bw-auth__resend-wrapper" variants={itemVariants}>
//                     {timer > 0 ? (
//                       <motion.span className="bw-auth__timer" variants={itemVariants}>
//                         Didn't get the code? Resend in {timer} seconds
//                       </motion.span>
//                     ) : (
//                       <motion.button
//                         className="bw-auth__resend-button"
//                         onClick={handleResendConfirmationCode}
//                         type="button"
//                         variants={itemVariants}
//                       >
//                         Resend Code
//                       </motion.button>
//                     )}
//                   </motion.div>
//                 </motion.div>

//                 {error && (
//                   <motion.div className="bw-auth__error" variants={itemVariants}>
//                     {error}
//                   </motion.div>
//                 )}

//                 <motion.div className="bw-auth__button-group" variants={itemVariants}>
//                   <motion.button
//                     className="bw-auth__button--back"
//                     type="button"
//                     onClick={handleBack}
//                     disabled={isLoading}
//                     variants={itemVariants}
//                   >
//                     Back
//                   </motion.button>
//                   <motion.button
//                     className="bw-auth__button"
//                     type="submit"
//                     disabled={isLoading || verificationDigits.some((digit) => digit === '')}
//                     variants={itemVariants}
//                   >
//                     {isLoading ? 'Verifying...' : 'Next'}
//                   </motion.button>
//                 </motion.div>
//               </motion.form>
//             ) : step === 3 ? (
//               <motion.div
//                 key="step3"
//                 className="bw-auth__form step3"
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 exit="exit"
//               >
//                 <motion.h1 className="question-heading" variants={itemVariants}>
//                   What is your first and last name?
//                 </motion.h1>
//                 <motion.div className="question-content" variants={itemVariants}>
//                   <motion.div variants={itemVariants}>
//                     <div className="form-group">
//                       <label className="bw-auth__label">First name</label>
//                       <motion.div className="bw-auth__input-wrapper" variants={itemVariants}>
//                         <input
//                           className="bw-auth__input bw-auth__input--gradient"
//                           type="text"
//                           placeholder="First name"
//                           value={formData.firstName}
//                           onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//                           disabled={isLoading}
//                         />
//                       </motion.div>
//                       {errors.firstName && (
//                         <motion.p className="bw-auth__error" variants={itemVariants}>
//                           {errors.firstName}
//                         </motion.p>
//                       )}
//                     </div>
//                     <div className="form-group">
//                       <label className="bw-auth__label">Last name</label>
//                       <motion.div className="bw-auth__input-wrapper" variants={itemVariants}>
//                         <input
//                           className="bw-auth__input bw-auth__input--gradient"
//                           type="text"
//                           placeholder="Last name"
//                           value={formData.lastName}
//                           onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
//                           disabled={isLoading}
//                         />
//                       </motion.div>
//                       {errors.lastName && (
//                         <motion.p className="bw-auth__error" variants={itemVariants}>
//                           {errors.lastName}
//                         </motion.p>
//                       )}
//                     </div>
//                   </motion.div>
//                   <motion.div className="bw-auth__button-group" variants={itemVariants}>
//                     <motion.button
//                       className="bw-auth__button--back"
//                       type="button"
//                       onClick={handleBack}
//                       disabled={isLoading}
//                       variants={itemVariants}
//                     >
//                       Back
//                     </motion.button>
//                     <motion.button
//                       className="bw-auth__button"
//                       onClick={handleNameStep}
//                       disabled={isLoading}
//                       variants={itemVariants}
//                     >
//                       {isLoading ? 'Saving...' : 'Next'}
//                     </motion.button>
//                   </motion.div>
//                 </motion.div>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="step4"
//                 className="bw-auth__form step4"
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 exit="exit"
//               >
//                 <motion.div className="question-content" variants={itemVariants}>
//                   <motion.h1 className="question-heading" variants={itemVariants}>
//                     Connect your Gmail account
//                   </motion.h1>
//                   <motion.p
//                     style={{ textAlign: 'center', marginBottom: '20px', color: '#e0e0e0' }}
//                     variants={itemVariants}
//                   >
//                     Connect your Gmail to enable email features.
//                   </motion.p>
//                   <motion.div variants={itemVariants}>
//                     <motion.button
//                       className="bw-auth__gmail-button"
//                       onClick={handleGmailSignIn}
//                       disabled={gmailLoading || isLoading}
//                       variants={itemVariants}
//                     >
//                       <motion.div variants={itemVariants}>
//                         <FaGoogle style={{ marginRight: '10px' }} />
//                       </motion.div>
//                       {gmailLoading ? 'Connecting...' : 'Sign in with Gmail'}
//                     </motion.button>
//                     {gmailError && (
//                       <motion.p className="bw-auth__error" variants={itemVariants}>
//                         {gmailError}
//                       </motion.p>
//                     )}
//                   </motion.div>
//                   <motion.div
//                     className="bw-auth__button-group"
//                     variants={itemVariants}
//                   >
//                     <motion.button
//                       className="bw-auth__skip-button"
//                       onClick={handleSkip}
//                       disabled={isLoading || gmailLoading}
//                       variants={itemVariants}
//                     >
//                       Skip for now
//                     </motion.button>
//                   </motion.div>
//                 </motion.div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {step === 1 && (
//           <motion.div className="bw-auth__terms" variants={itemVariants}>
//             By using BestWork you agree to the{' '}
//             <motion.a href="/terms" onClick={openTermsModal} variants={itemVariants}>
//               Terms of Service
//             </motion.a>{' '}
//             and{' '}
//             <motion.a href="/privacy" onClick={openPrivacyModal} variants={itemVariants}>
//               Privacy Policy
//             </motion.a>
//           </motion.div>
//         )}
//       </div>

//       {isPrivacyModalOpen && (
//         <motion.div
//           className="bw-auth__modal-overlay"
//           variants={modalOverlayVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//         >
//           <motion.div
//             className="bw-auth__modal"
//             variants={modalVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//           >
//             <motion.button
//               className="bw-auth__modal-close"
//               onClick={closePrivacyModal}
//               variants={itemVariants}
//             >
//               ×
//             </motion.button>
//             <motion.div className="bw-auth__modal-content" variants={containerVariants}>
//               <motion.h2 variants={itemVariants}>Privacy Policy</motion.h2>
//               <motion.p variants={itemVariants}>
//                 <strong>Effective Date:</strong> March 11, 2025
//               </motion.p>
//               <motion.p variants={itemVariants}>
//                 <strong>Last Updated:</strong> March 11, 2025
//               </motion.p>
//               <motion.p variants={itemVariants}>
//                 LevelUp Innovations Inc., doing business as BestWork ("BestWork," "we," "us," or
//                 "our"), is committed to protecting your privacy...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>1. Information We Collect</motion.h3>
//               <motion.p variants={itemVariants}>We may collect the following types of information:</motion.p>
//               <motion.h4 variants={itemVariants}>a. Personal Information</motion.h4>
//               <motion.ul variants={itemVariants}>
//                 <motion.li variants={itemVariants}>
//                   <strong>Contact Information:</strong> Name, email address, phone number...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <strong>Account Information:</strong> Username, password...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <strong>Payment Information:</strong> Billing details...
//                 </motion.li>
//               </motion.ul>
//               <motion.h4 variants={itemVariants}>b. Usage Data</motion.h4>
//               <motion.ul variants={itemVariants}>
//                 <motion.li variants={itemVariants}>
//                   <strong>Technical Information:</strong> IP address, browser type...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <strong>Service Usage:</strong> Information about how you use the Service...
//                 </motion.li>
//               </motion.ul>
//               <motion.h4 variants={itemVariants}>c. User-Provided Content</motion.h4>
//               <motion.p variants={itemVariants}>
//                 Any data, files, or content you upload...
//               </motion.p>
//               <motion.h4 variants={itemVariants}>d. Cookies and Tracking Technologies</motion.h4>
//               <motion.p variants={itemVariants}>
//                 We use cookies, web beacons, and similar technologies...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>2. How We Use Your Information</motion.h3>
//               <motion.ul variants={itemVariants}>
//                 <motion.li variants={itemVariants}>To provide, maintain, and improve the Service.</motion.li>
//                 <motion.li variants={itemVariants}>To process transactions and manage your account.</motion.li>
//                 <motion.li variants={itemVariants}>To communicate with you...</motion.li>
//                 <motion.li variants={itemVariants}>To analyze usage trends...</motion.li>
//                 <motion.li variants={itemVariants}>To comply with legal obligations...</motion.li>
//               </motion.ul>
//               <motion.h3 variants={itemVariants}>3. How We Share Your Information</motion.h3>
//               <motion.p variants={itemVariants}>
//                 We do not sell your personal information...
//               </motion.p>
//               <motion.ul variants={itemVariants}>
//                 <motion.li variants={itemVariants}>
//                   <strong>Service Providers:</strong> With trusted third-party vendors...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <strong>Legal Requirements:</strong> When required by law...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <strong>Business Transfers:</strong> In connection with a merger...
//                 </motion.li>
//               </motion.ul>
//               <motion.h3 variants={itemVariants}>4. Data Security</motion.h3>
//               <motion.p variants={itemVariants}>
//                 We implement reasonable technical and organizational measures...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>5. Your Choices and Rights</motion.h3>
//               <motion.p variants={itemVariants}>
//                 Depending on your location, you may have the following rights...
//               </motion.p>
//               <motion.ul variants={itemVariants}>
//                 <motion.li variants={itemVariants}>
//                   <strong>Access:</strong> Request a copy of the personal data...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <strong>Correction:</strong> Request that we correct inaccurate...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <strong>Deletion:</strong> Request that we delete your personal data...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <strong>Opt-Out:</strong> Opt out of marketing communications...
//                 </motion.li>
//               </motion.ul>
//               <motion.p variants={itemVariants}>
//                 To exercise these rights, please contact us at{' '}
//                 <motion.a href="mailto:britt@bestwork.ai" variants={itemVariants}>
//                   britt@bestwork.ai
//                 </motion.a>.
//               </motion.p>
//               <motion.h3 variants={itemVariants}>6. Data Retention</motion.h3>
//               <motion.p variants={itemVariants}>
//                 We retain your information for as long as necessary...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>7. Third-Party Links</motion.h3>
//               <motion.p variants={itemVariants}>
//                 The Service may contain links to third-party websites...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>8. Children’s Privacy</motion.h3>
//               <motion.p variants={itemVariants}>
//                 The Service is not intended for individuals under the age of 13...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>9. International Data Transfers</motion.h3>
//               <motion.p variants={itemVariants}>
//                 BestWork is based in the United States...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>10. Changes to This Privacy Policy</motion.h3>
//               <motion.p variants={itemVariants}>
//                 We may update this Privacy Policy from time to time...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>11. Contact Us</motion.h3>
//               <motion.p variants={itemVariants}>
//                 If you have questions or concerns about this Privacy Policy...
//                 <br />
//                 LevelUp Innovations Inc.
//                 <br />
//                 Doing Business As: BestWork
//                 <br />
//                 8 The Green, Suite B
//                 <br />
//                 Dover, DE, 19901
//                 <br />
//                 Email:{' '}
//                 <motion.a href="mailto:britt@bestwork.ai" variants={itemVariants}>
//                   britt@bestwork.ai
//                 </motion.a>
//                 <br />
//                 Phone: 917-974-2908
//               </motion.p>
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       )}

//       {isTermsModalOpen && (
//         <motion.div
//           className="bw-auth__modal-overlay"
//           variants={modalOverlayVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//         >
//           <motion.div
//             className="bw-auth__modal"
//             variants={modalVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//           >
//             <motion.button
//               className="bw-auth__modal-close"
//               onClick={closeTermsModal}
//               variants={itemVariants}
//             >
//               ×
//             </motion.button>
//             <motion.div className="bw-auth__modal-content" variants={containerVariants}>
//               <motion.h2 variants={itemVariants}>Terms of Service</motion.h2>
//               <motion.p variants={itemVariants}>
//                 <strong>Effective Date:</strong> March 11, 2025
//               </motion.p>
//               <motion.p variants={itemVariants}>
//                 <strong>Last Updated:</strong> March 11, 2025
//               </motion.p>
//               <motion.p variants={itemVariants}>
//                 LevelUp Innovations Inc., doing business as BestWork ("BestWork," "we," "us," or
//                 "our")...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>1. Eligibility</motion.h3>
//               <motion.p variants={itemVariants}>
//                 You must be at least 13 years of age to use the Service...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>2. Account Registration</motion.h3>
//               <motion.p variants={itemVariants}>
//                 To access certain features of the Service, you must create an account...
//               </motion.p>
//               <motion.ul variants={itemVariants}>
//                 <motion.li variants={itemVariants}>
//                   Provide accurate, current, and complete information...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   Maintain the security of your account credentials...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   Be responsible for all activities that occur under your account.
//                 </motion.li>
//               </motion.ul>
//               <motion.h3 variants={itemVariants}>3. Use of the Service</motion.h3>
//               <motion.p variants={itemVariants}>
//                 You agree to use the Service only for lawful purposes...
//               </motion.p>
//               <motion.ul variants={itemVariants}>
//                 <motion.li variants={itemVariants}>
//                   Use the Service to engage in any illegal or unauthorized activity.
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   Attempt to gain unauthorized access...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   Upload or transmit any harmful code...
//                 </motion.li>
//                 <motion.li variants={itemVariants}>Interfere with or disrupt...</motion.li>
//               </motion.ul>
//               <motion.h3 variants={itemVariants}>4. User Content</motion.h3>
//               <motion.p variants={itemVariants}>
//                 You retain ownership of any content you upload...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>5. Intellectual Property</motion.h3>
//               <motion.p variants={itemVariants}>
//                 The Service, including its design, text, graphics...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>6. Payment and Subscription</motion.h3>
//               <motion.p variants={itemVariants}>
//                 Certain features of the Service may require payment...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>7. Termination</motion.h3>
//               <motion.p variants={itemVariants}>
//                 We may suspend or terminate your access to the Service...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>8. Disclaimer of Warranties</motion.h3>
//               <motion.p variants={itemVariants}>
//                 The Service is provided "as is" and "as available"...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>9. Limitation of Liability</motion.h3>
//               <motion.p variants={itemVariants}>
//                 To the fullest extent permitted by law...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>10. Indemnification</motion.h3>
//               <motion.p variants={itemVariants}>
//                 You agree to indemnify and hold harmless BestWork...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>11. Governing Law and Dispute Resolution</motion.h3>
//               <motion.p variants={itemVariants}>
//                 These Terms are governed by the laws of the State of Delaware...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>12. Changes to These Terms</motion.h3>
//               <motion.p variants={itemVariants}>
//                 We may update these Terms from time to time...
//               </motion.p>
//               <motion.h3 variants={itemVariants}>13. Contact Us</motion.h3>
//               <motion.p variants={itemVariants}>
//                 If you have questions or concerns about these Terms...
//                 <br />
//                 LevelUp Innovations Inc.
//                 <br />
//                 Doing Business As: BestWork
//                 <br />
//                 8 The Green, Suite B
//                 <br />
//                 Dover, DE, 19901
//                 <br />
//                 Email:{' '}
//                 <motion.a href="mailto:britt@bestwork.ai" variants={itemVariants}>
//                   britt@bestwork.ai
//                 </motion.a>
//                 <br />
//                 Phone: 917-974-2908
//               </motion.p>
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default SignUp;

import React, { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import awsExports from '../aws-exports';
import './SignUp.css';

Amplify.configure(awsExports);

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmationCode: '',
    username: '',
    firstName: '',
    lastName: '',
  });

  const [verificationDigits, setVerificationDigits] = useState(['', '', '', '', '', '']);
  const digitRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
  ];

  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const totalSteps = 3;
  const progressPercentage = (step / totalSteps) * 100;

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const storedData = localStorage.getItem('authData');
    const stateData = location.state?.formData;
    if (stateData) {
      setFormData((prev) => ({ ...prev, ...stateData }));
      localStorage.setItem('authData', JSON.stringify(stateData));
    } else if (storedData) {
      setFormData((prev) => ({ ...prev, ...JSON.parse(storedData) }));
    }
  }, [location.state]);

  const validatePassword = (password) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const generateUsername = (email) => {
    return email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  };

  const handleDigitChange = (index, value, isPaste = false) => {
    if (isPaste) {
      const pastedValue = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...verificationDigits];
      for (let i = 0; i < pastedValue.length && i < 6; i++) {
        newDigits[i] = pastedValue[i];
      }
      setVerificationDigits(newDigits);
      setFormData((prev) => ({
        ...prev,
        confirmationCode: newDigits.join(''),
      }));
      const focusIndex = Math.min(pastedValue.length, 5);
      digitRefs[focusIndex].current?.focus();
    } else {
      if (!/^\d*$/.test(value)) return;
      const newDigits = [...verificationDigits];
      newDigits[index] = value;
      setVerificationDigits(newDigits);
      setFormData((prev) => ({
        ...prev,
        confirmationCode: newDigits.join(''),
      }));
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

  const validateNameStep = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    return newErrors;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!Object.values(passwordRequirements).every(Boolean)) {
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const username = generateUsername(formData.email);
      await Auth.signUp({
        username,
        password: formData.password,
        attributes: { email: formData.email },
      });
      setFormData((prev) => ({ ...prev, username }));
      setStep(2);
      setTimer(60);
    } catch (err) {
      if (err.code === 'UsernameExistsException') {
        try {
          const username = generateUsername(formData.email);
          await Auth.resendSignUp(username);
          setFormData((prev) => ({ ...prev, username }));
          setStep(2);
          setTimer(60);
        } catch (resendErr) {
          setError(resendErr.code === 'InvalidParameterException' 
            ? 'Account already exists. Please sign in.' 
            : resendErr.message || 'Error resending code');
        }
      } else {
        setError(err.message || 'Error during sign up');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await Auth.confirmSignUp(formData.username, formData.confirmationCode);
      await Auth.signIn(formData.email, formData.password);
      const storedTemplateData = localStorage.getItem('templateData');
      const storedPlan = localStorage.getItem('selectedPlan');
      if (storedTemplateData) {
        try {
          const templateData = JSON.parse(storedTemplateData);
          const payload = {
            userEmail: formData.email,
            selectedPlan: storedPlan || 'starter',
            ...templateData,
          };
          const response = await fetch(
            'https://2ofjdl14kg.execute-api.us-east-1.amazonaws.com/prod/publish',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to publish template (Status: ${response.status})`);
          }
          localStorage.removeItem('templateData');
          localStorage.removeItem('selectedPlan');
        } catch (publishErr) {
          setError(publishErr.message || 'Failed to publish template.');
        }
      }
      setStep(3);
    } catch (err) {
      setError(err.code === 'NotAuthorizedException' 
        ? 'Invalid password. Please try again or reset your password.' 
        : err.message || 'Error confirming sign up or signing in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmationCode = async () => {
    try {
      await Auth.resendSignUp(formData.username);
      setTimer(60);
    } catch (err) {
      setError(err.message || 'Error resending code');
    }
  };

  const saveUserData = async () => {
    setIsLoading(true);
    let email = formData.email;
    try {
      const user = await Auth.currentAuthenticatedUser();
      email = user.attributes?.email || user.username;
      if (!email) {
        throw new Error('User email not found in authentication data');
      }
    } catch (err) {
      setError('Authentication issue. Please sign in again.');
      navigate('/signin', { replace: true });
      setIsLoading(false);
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(
        'https://xt6yqqk9h1.execute-api.us-east-1.amazonaws.com/dev/save-data',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save data');
      }
      return true;
    } catch (error) {
      setError(
        error.message.includes('Missing required field: email')
          ? 'Failed to save data: Email is missing.'
          : error.message.includes('aborted')
          ? 'Request timed out.'
          : `Failed to save your data: ${error.message}.`
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameStep = async () => {
    const validationErrors = validateNameStep();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      alert('Please fill in all required fields');
      return;
    }
    localStorage.setItem('authData', JSON.stringify(formData));
    const saveSuccess = await saveUserData();
    if (saveSuccess) {
      localStorage.removeItem('authData');
      navigate('/dashboard', { state: { userEmail: formData.email }, replace: true });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      setVerificationDigits(['', '', '', '', '', '']);
    }
  };

  const openPrivacyModal = (e) => {
    e.preventDefault();
    setIsPrivacyModalOpen(true);
    setIsTermsModalOpen(false);
  };

  const closePrivacyModal = () => setIsPrivacyModalOpen(false);

  const openTermsModal = (e) => {
    e.preventDefault();
    setIsTermsModalOpen(true);
    setIsPrivacyModalOpen(false);
  };

  const closeTermsModal = () => setIsTermsModalOpen(false);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  const modalOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="bw-auth">
      <motion.div
        className="bw-auth__logo-container"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src="/assets/logo_colors_3d.png"
          alt="BestWork Logo"
          className="bw-auth__logo"
          variants={itemVariants}
        />
      </motion.div>

      <motion.div
        className="bw-auth__progress-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div className="bw-auth__progress-bar" variants={itemVariants}>
          <motion.div
            className="bw-auth__progress-bar-filled"
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          ></motion.div>
        </motion.div>
      </motion.div>

      <div className="bw-auth__container">
        <div className="bw-auth__content">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                className="bw-auth__form step1"
                onSubmit={handleSignUp}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.h1 className="bw-auth__title" variants={itemVariants}>
                  Sign up for BestWork
                </motion.h1>
                <motion.div variants={itemVariants}>
                  <div className="bw-auth__field-group">
                    <label className="bw-auth__label">Email</label>
                    <motion.div className="bw-auth__input-wrapper" variants={itemVariants}>
                      <input
                        type="email"
                        className="bw-auth__input bw-auth__input--gradient"
                        placeholder="example@work.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </motion.div>
                  </div>
                  <div className="bw-auth__field-group">
                    <label className="bw-auth__label">Password</label>
                    <motion.div variants={itemVariants}>
                      <div className="bw-auth__password-container">
                        <div className="bw-auth__input-wrapper">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="bw-auth__input bw-auth__input--gradient"
                            placeholder="********"
                            value={formData.password}
                            onChange={(e) => {
                              const newPassword = e.target.value;
                              setFormData({ ...formData, password: newPassword });
                              setPasswordTouched(true);
                              validatePassword(newPassword);
                            }}
                            required
                          />
                        </div>
                        <button
                          className="bw-auth__password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          {showPassword ? '👁️' : '👁️‍🗨'}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {passwordTouched && (
                  <motion.div className="bw-auth__password-requirements" variants={itemVariants}>
                    <motion.h4 variants={itemVariants}>Password Requirements:</motion.h4>
                    <motion.ul variants={itemVariants}>
                      <motion.li
                        className={passwordRequirements.length ? 'valid' : ''}
                        variants={itemVariants}
                      >
                        At least 8 characters
                      </motion.li>
                      <motion.li
                        className={passwordRequirements.uppercase ? 'valid' : ''}
                        variants={itemVariants}
                      >
                        At least one uppercase letter
                      </motion.li>
                      <motion.li
                        className={passwordRequirements.number ? 'valid' : ''}
                        variants={itemVariants}
                      >
                        At least one number
                      </motion.li>
                      <motion.li
                        className={passwordRequirements.specialChar ? 'valid' : ''}
                        variants={itemVariants}
                      >
                        At least one special character
                      </motion.li>
                    </motion.ul>
                  </motion.div>
                )}

                {error && (
                  <motion.div className="bw-auth__error" variants={itemVariants}>
                    {error}
                  </motion.div>
                )}

                <motion.button
                  className="bw-auth__button"
                  type="submit"
                  disabled={isLoading || !Object.values(passwordRequirements).every(Boolean)}
                  variants={itemVariants}
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </motion.button>

                <motion.div className="bw-auth__signin-link" variants={itemVariants}>
                  Already have an account?{' '}
                  <motion.a href="/signin" variants={itemVariants}>
                    Sign in
                  </motion.a>
                </motion.div>
              </motion.form>
            ) : step === 2 ? (
              <motion.form
                key="step2"
                className="bw-auth__form step2"
                onSubmit={handleVerification}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.h2 className="bw-auth__verification-title" variants={itemVariants}>
                  Enter the verification code sent to your email
                </motion.h2>

                <motion.div className="bw-auth__field-group" variants={itemVariants}>
                  <motion.label className="bw-auth__label" variants={itemVariants}>
                    Verification code
                  </motion.label>
                  <motion.div className="bw-auth__verification-digits" variants={itemVariants}>
                    {verificationDigits.map((digit, index) => (
                      <motion.div key={index} className="bw-auth__digit-wrapper" variants={itemVariants}>
                        <input
                          ref={digitRefs[index]}
                          type="text"
                          className="bw-auth__digit bw-auth__input--gradient"
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
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div className="bw-auth__resend-wrapper" variants={itemVariants}>
                    {timer > 0 ? (
                      <motion.span className="bw-auth__timer" variants={itemVariants}>
                        Didn't get the code? Resend in {timer} seconds
                      </motion.span>
                    ) : (
                      <motion.button
                        className="bw-auth__resend-button"
                        onClick={handleResendConfirmationCode}
                        type="button"
                        variants={itemVariants}
                      >
                        Resend Code
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>

                {error && (
                  <motion.div className="bw-auth__error" variants={itemVariants}>
                    {error}
                  </motion.div>
                )}

                <motion.div className="bw-auth__button-group" variants={itemVariants}>
                  <motion.button
                    className="bw-auth__button--back"
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    variants={itemVariants}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    className="bw-auth__button"
                    type="submit"
                    disabled={isLoading || verificationDigits.some((digit) => digit === '')}
                    variants={itemVariants}
                  >
                    {isLoading ? 'Verifying...' : 'Next'}
                  </motion.button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                key="step3"
                className="bw-auth__form step3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.h1 className="question-heading" variants={itemVariants}>
                  What is your first and last name?
                </motion.h1>
                <motion.div className="question-content" variants={itemVariants}>
                  <motion.div variants={itemVariants}>
                    <div className="form-group">
                      <label className="bw-auth__label">First name</label>
                      <motion.div className="bw-auth__input-wrapper" variants={itemVariants}>
                        <input
                          className="bw-auth__input bw-auth__input--gradient"
                          type="text"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          disabled={isLoading}
                        />
                      </motion.div>
                      {errors.firstName && (
                        <motion.p className="bw-auth__error" variants={itemVariants}>
                          {errors.firstName}
                        </motion.p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="bw-auth__label">Last name</label>
                      <motion.div className="bw-auth__input-wrapper" variants={itemVariants}>
                        <input
                          className="bw-auth__input bw-auth__input--gradient"
                          type="text"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          disabled={isLoading}
                        />
                      </motion.div>
                      {errors.lastName && (
                        <motion.p className="bw-auth__error" variants={itemVariants}>
                          {errors.lastName}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                  <motion.div className="bw-auth__button-group" variants={itemVariants}>
                    <motion.button
                      className="bw-auth__button--back"
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      variants={itemVariants}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      className="bw-auth__button"
                      onClick={handleNameStep}
                      disabled={isLoading}
                      variants={itemVariants}
                    >
                      {isLoading ? 'Saving...' : 'Next'}
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === 1 && (
          <motion.div className="bw-auth__terms" variants={itemVariants}>
            By using BestWork you agree to the{' '}
            <motion.a href="/terms" onClick={openTermsModal} variants={itemVariants}>
              Terms of Service
            </motion.a>{' '}
            and{' '}
            <motion.a href="/privacy" onClick={openPrivacyModal} variants={itemVariants}>
              Privacy Policy
            </motion.a>
          </motion.div>
        )}
      </div>

      {isPrivacyModalOpen && (
        <motion.div
          className="bw-auth__modal-overlay"
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bw-auth__modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              className="bw-auth__modal-close"
              onClick={closePrivacyModal}
              variants={itemVariants}
            >
              ×
            </motion.button>
            <motion.div className="bw-auth__modal-content" variants={containerVariants}>
              <motion.h2 variants={itemVariants}>Privacy Policy</motion.h2>
              <motion.p variants={itemVariants}>
                <strong>Effective Date:</strong> March 11, 2025
              </motion.p>
              <motion.p variants={itemVariants}>
                <strong>Last Updated:</strong> March 11, 2025
              </motion.p>
              <motion.p variants={itemVariants}>
                LevelUp Innovations Inc., doing business as BestWork ("BestWork," "we," "us," or
                "our"), is committed to protecting your privacy...
              </motion.p>
              <motion.h3 variants={itemVariants}>1. Information We Collect</motion.h3>
              <motion.p variants={itemVariants}>We may collect the following types of information:</motion.p>
              <motion.h4 variants={itemVariants}>a. Personal Information</motion.h4>
              <motion.ul variants={itemVariants}>
                <motion.li variants={itemVariants}>
                  <strong>Contact Information:</strong> Name, email address, phone number...
                </motion.li>
                <motion.li variants={itemVariants}>
                  <strong>Account Information:</strong> Username, password...
                </motion.li>
                <motion.li variants={itemVariants}>
                  <strong>Payment Information:</strong> Billing details...
                </motion.li>
              </motion.ul>
              <motion.h4 variants={itemVariants}>b. Usage Data</motion.h4>
              <motion.ul variants={itemVariants}>
                <motion.li variants={itemVariants}>
                  <strong>Technical Information:</strong> IP address, browser type...
                </motion.li>
                <motion.li variants={itemVariants}>
                  <strong>Service Usage:</strong> Information about how you use the Service...
                </motion.li>
              </motion.ul>
              <motion.h4 variants={itemVariants}>c. User-Provided Content</motion.h4>
              <motion.p variants={itemVariants}>
                Any data, files, or content you upload...
              </motion.p>
              <motion.h4 variants={itemVariants}>d. Cookies and Tracking Technologies</motion.h4>
              <motion.p variants={itemVariants}>
                We use cookies, web beacons, and similar technologies...
              </motion.p>
              <motion.h3 variants={itemVariants}>2. How We Use Your Information</motion.h3>
              <motion.ul variants={itemVariants}>
                <motion.li variants={itemVariants}>To provide, maintain, and improve the Service.</motion.li>
                <motion.li variants={itemVariants}>To process transactions and manage your account.</motion.li>
                <motion.li variants={itemVariants}>To communicate with you...</motion.li>
                <motion.li variants={itemVariants}>To analyze usage trends...</motion.li>
                <motion.li variants={itemVariants}>To comply with legal obligations...</motion.li>
              </motion.ul>
              <motion.h3 variants={itemVariants}>3. How We Share Your Information</motion.h3>
              <motion.p variants={itemVariants}>
                We do not sell your personal information...
              </motion.p>
              <motion.ul variants={itemVariants}>
                <motion.li variants={itemVariants}>
                  <strong>Service Providers:</strong> With trusted third-party vendors...
                </motion.li>
                <motion.li variants={itemVariants}>
                  <strong>Legal Requirements:</strong> When required by law...
                </motion.li>
                <motion.li variants={itemVariants}>
                  <strong>Business Transfers:</strong> In connection with a merger...
                </motion.li>
              </motion.ul>
              <motion.h3 variants={itemVariants}>4. Data Security</motion.h3>
              <motion.p variants={itemVariants}>
                We implement reasonable technical and organizational measures...
              </motion.p>
              <motion.h3 variants={itemVariants}>5. Your Choices and Rights</motion.h3>
              <motion.p variants={itemVariants}>
                Depending on your location, you may have the following rights...
              </motion.p>
              <motion.ul variants={itemVariants}>
                <motion.li variants={itemVariants}>
                  <strong>Access:</strong> Request a copy of the personal data...
                </motion.li>
                <motion.li variants={itemVariants}>
                  <strong>Correction:</strong> Request that we correct inaccurate...
                </motion.li>
                <motion.li variants={itemVariants}>
                  <strong>Deletion:</strong> Request that we delete your personal data...
                </motion.li>
                <motion.li variants={itemVariants}>
                  <strong>Opt-Out:</strong> Opt out of marketing communications...
                </motion.li>
              </motion.ul>
              <motion.p variants={itemVariants}>
                To exercise these rights, please contact us at{' '}
                <motion.a href="mailto:britt@bestwork.ai" variants={itemVariants}>
                  britt@bestwork.ai
                </motion.a>.
              </motion.p>
              <motion.h3 variants={itemVariants}>6. Data Retention</motion.h3>
              <motion.p variants={itemVariants}>
                We retain your information for as long as necessary...
              </motion.p>
              <motion.h3 variants={itemVariants}>7. Third-Party Links</motion.h3>
              <motion.p variants={itemVariants}>
                The Service may contain links to third-party websites...
              </motion.p>
              <motion.h3 variants={itemVariants}>8. Children’s Privacy</motion.h3>
              <motion.p variants={itemVariants}>
                The Service is not intended for individuals under the age of 13...
              </motion.p>
              <motion.h3 variants={itemVariants}>9. International Data Transfers</motion.h3>
              <motion.p variants={itemVariants}>
                BestWork is based in the United States...
              </motion.p>
              <motion.h3 variants={itemVariants}>10. Changes to This Privacy Policy</motion.h3>
              <motion.p variants={itemVariants}>
                We may update this Privacy Policy from time to time...
              </motion.p>
              <motion.h3 variants={itemVariants}>11. Contact Us</motion.h3>
              <motion.p variants={itemVariants}>
                If you have questions or concerns about this Privacy Policy...
                <br />
                LevelUp Innovations Inc.
                <br />
                Doing Business As: BestWork
                <br />
                8 The Green, Suite B
                <br />
                Dover, DE, 19901
                <br />
                Email:{' '}
                <motion.a href="mailto:britt@bestwork.ai" variants={itemVariants}>
                  britt@bestwork.ai
                </motion.a>
                <br />
                Phone: 917-974-2908
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {isTermsModalOpen && (
        <motion.div
          className="bw-auth__modal-overlay"
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bw-auth__modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              className="bw-auth__modal-close"
              onClick={closeTermsModal}
              variants={itemVariants}
            >
              ×
            </motion.button>
            <motion.div className="bw-auth__modal-content" variants={containerVariants}>
              <motion.h2 variants={itemVariants}>Terms of Service</motion.h2>
              <motion.p variants={itemVariants}>
                <strong>Effective Date:</strong> March 11, 2025
              </motion.p>
              <motion.p variants={itemVariants}>
                <strong>Last Updated:</strong> March 11, 2025
              </motion.p>
              <motion.p variants={itemVariants}>
                LevelUp Innovations Inc., doing business as BestWork ("BestWork," "we," "us," or
                "our")...
              </motion.p>
              <motion.h3 variants={itemVariants}>1. Eligibility</motion.h3>
              <motion.p variants={itemVariants}>
                You must be at least 13 years of age to use the Service...
              </motion.p>
              <motion.h3 variants={itemVariants}>2. Account Registration</motion.h3>
              <motion.p variants={itemVariants}>
                To access certain features of the Service, you must create an account...
              </motion.p>
              <motion.ul variants={itemVariants}>
                <motion.li variants={itemVariants}>
                  Provide accurate, current, and complete information...
                </motion.li>
                <motion.li variants={itemVariants}>
                  Maintain the security of your account credentials...
                </motion.li>
                <motion.li variants={itemVariants}>
                  Be responsible for all activities that occur under your account.
                </motion.li>
              </motion.ul>
              <motion.h3 variants={itemVariants}>3. Use of the Service</motion.h3>
              <motion.p variants={itemVariants}>
                You agree to use the Service only for lawful purposes...
              </motion.p>
              <motion.ul variants={itemVariants}>
                <motion.li variants={itemVariants}>
                  Use the Service to engage in any illegal or unauthorized activity.
                </motion.li>
                <motion.li variants={itemVariants}>
                  Attempt to gain unauthorized access...
                </motion.li>
                <motion.li variants={itemVariants}>
                  Upload or transmit any harmful code...
                </motion.li>
                <motion.li variants={itemVariants}>Interfere with or disrupt...</motion.li>
              </motion.ul>
              <motion.h3 variants={itemVariants}>4. User Content</motion.h3>
              <motion.p variants={itemVariants}>
                You retain ownership of any content you upload...
              </motion.p>
              <motion.h3 variants={itemVariants}>5. Intellectual Property</motion.h3>
              <motion.p variants={itemVariants}>
                The Service, including its design, text, graphics...
              </motion.p>
              <motion.h3 variants={itemVariants}>6. Payment and Subscription</motion.h3>
              <motion.p variants={itemVariants}>
                Certain features of the Service may require payment...
              </motion.p>
              <motion.h3 variants={itemVariants}>7. Termination</motion.h3>
              <motion.p variants={itemVariants}>
                We may suspend or terminate your access to the Service...
              </motion.p>
              <motion.h3 variants={itemVariants}>8. Disclaimer of Warranties</motion.h3>
              <motion.p variants={itemVariants}>
                The Service is provided "as is" and "as available"...
              </motion.p>
              <motion.h3 variants={itemVariants}>9. Limitation of Liability</motion.h3>
              <motion.p variants={itemVariants}>
                To the fullest extent permitted by law...
              </motion.p>
              <motion.h3 variants={itemVariants}>10. Indemnification</motion.h3>
              <motion.p variants={itemVariants}>
                You agree to indemnify and hold harmless BestWork...
              </motion.p>
              <motion.h3 variants={itemVariants}>11. Governing Law and Dispute Resolution</motion.h3>
              <motion.p variants={itemVariants}>
                These Terms are governed by the laws of the State of Delaware...
              </motion.p>
              <motion.h3 variants={itemVariants}>12. Changes to These Terms</motion.h3>
              <motion.p variants={itemVariants}>
                We may update these Terms from time to time...
              </motion.p>
              <motion.h3 variants={itemVariants}>13. Contact Us</motion.h3>
              <motion.p variants={itemVariants}>
                If you have questions or concerns about these Terms...
                <br />
                LevelUp Innovations Inc.
                <br />
                Doing Business As: BestWork
                <br />
                8 The Green, Suite B
                <br />
                Dover, DE, 19901
                <br />
                Email:{' '}
                <motion.a href="mailto:britt@bestwork.ai" variants={itemVariants}>
                  britt@bestwork.ai
                </motion.a>
                <br />
                Phone: 917-974-2908
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SignUp;