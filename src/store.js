import create from 'zustand';
import { Auth } from 'aws-amplify';

const CACHE_KEY = 'userDataCache';

const useAuthStore = create((set) => ({
  userData: JSON.parse(localStorage.getItem(CACHE_KEY)) || {
    userEmail: '',
    firstName: 'Unknown',
    lastName: 'User',
    isGmailConnected: false,
    templates: [],
    lastFetched: 0,
  },
  authStatus: null,
  error: null,
  fetchUserData: async (isPolling = false) => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const email = user.attributes?.email || user.username;
      if (!email) throw new Error('User email not found');

      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        'https://tiyaf0vu0a.execute-api.us-east-1.amazonaws.com/dev/fetch-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email,
            fields: ['firstName', 'lastName', 'gmailToken', 'templates'],
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
      const newUserData = {
        userEmail: email,
        firstName: userDataResponse.firstName || 'Unknown',
        lastName: userDataResponse.lastName || 'User',
        isGmailConnected: userDataResponse.isGmailConnected ?? false,
        templates: Array.isArray(userDataResponse.templates)
          ? userDataResponse.templates.map((server) => ({
              ...server,
              lastUpdated: server.lastUpdated || Date.now(),
            }))
          : [],
        lastFetched: Date.now(),
      };

      set((state) => {
        const hasChanges =
          newUserData.firstName !== state.userData.firstName ||
          newUserData.lastName !== state.userData.lastName ||
          newUserData.isGmailConnected !== state.userData.isGmailConnected ||
          JSON.stringify(newUserData.templates) !== JSON.stringify(state.userData.templates);
        if (hasChanges || isPolling) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(newUserData));
          return { userData: newUserData, authStatus: true, error: null };
        }
        return state;
      });
    } catch (err) {
      console.error('fetchUserData:', err);
      if (!isPolling) {
        set({ authStatus: false, error: err.message });
        await Auth.signOut();
        localStorage.removeItem(CACHE_KEY);
      }
    }
  },
  updateUserData: (newData) => {
    set((state) => {
      const updatedData = { ...state.userData, ...newData, lastFetched: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedData));
      return { userData: updatedData };
    });
  },
  clearError: () => set({ error: null }),
}));

export default useAuthStore;