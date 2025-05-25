import { Auth } from "aws-amplify";
import DOMPurify from "dompurify";

// Use Vite's import.meta.env for environment variables
const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL || "https://u3lgxb3rae.execute-api.us-east-1.amazonaws.com/dev";

const getAuthToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};

// Generic API call function for Lambda Proxy integration
export const makeApiCall = async (endpoint, method = "POST", data = null, queryParams = null) => {
  try {
    const token = await getAuthToken();
    const sanitizedEndpoint = DOMPurify.sanitize(endpoint);
    const url = queryParams
      ? `${PROXY_API_URL}${sanitizedEndpoint}?${new URLSearchParams(queryParams).toString()}`
      : `${PROXY_API_URL}${sanitizedEndpoint}`;

    const sanitizedData = data
      ? JSON.parse(DOMPurify.sanitize(JSON.stringify(data), { RETURN_DOM: false }))
      : null;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: sanitizedData ? JSON.stringify(sanitizedData) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    throw error;
  }
};

// Onboarding.jsx endpoints
export const checkTeamCode = async (code) => {
  if (!code) throw new Error("Team code is required");
  const sanitizedCode = DOMPurify.sanitize(code);
  const result = await makeApiCall("/check-team-code", "POST", { teamCode: sanitizedCode });
  return result.exists;
};

export const saveData = async (payload) => {
  return await makeApiCall("/save-data", "POST", payload);
};

export const getHubspotInstallUrl = async (userEmail) => {
  const sanitizedEmail = DOMPurify.sanitize(userEmail);
  const result = await makeApiCall("/hubspot-install", "GET", null, { userEmail: sanitizedEmail });
  return result.url;
};

export const getSalesforceInstallUrl = async (userEmail) => {
  const sanitizedEmail = DOMPurify.sanitize(userEmail);
  const result = await makeApiCall("/salesforce-install", "GET", null, { userEmail: sanitizedEmail });
  return result.url;
};

// Dashboard.jsx endpoints
export const fetchEmployerData = async (employerEmail) => {
  if (!employerEmail) throw new Error("Employer email is required");
  const sanitizedEmail = DOMPurify.sanitize(employerEmail);
  return await makeApiCall("/fetch-employer-data", "GET", null, { employerEmail: sanitizedEmail });
};

export const fetchHubspotEngagements = async (employeeEmail) => {
  if (!employeeEmail) throw new Error("Employee email is required");
  const sanitizedEmail = DOMPurify.sanitize(employeeEmail);
  return await makeApiCall("/fetch-hubspot-engagements", "GET", null, { employeeEmail: sanitizedEmail });
};

export const slackOauthExchange = async (code, redirectUri, email) => {
  if (!code || !email) throw new Error("Code and email are required for Slack OAuth exchange");
  const sanitizedCode = DOMPurify.sanitize(code);
  const sanitizedRedirectUri = DOMPurify.sanitize(redirectUri);
  const sanitizedEmail = DOMPurify.sanitize(email);
  return await makeApiCall("/slack-oauth-exchange", "POST", {
    action: "exchange_code",
    code: sanitizedCode,
    redirect_uri: sanitizedRedirectUri,
    email: sanitizedEmail,
  });
};