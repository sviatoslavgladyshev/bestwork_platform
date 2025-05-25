import { Auth } from "aws-amplify";

const checkUserSignIn = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    console.log("User is signed in:", user);

    // Access tokens
    const session = user.signInUserSession;
    console.log("Access Token:", session.accessToken.jwtToken);
    console.log("ID Token:", session.idToken.jwtToken);
    console.log("Refresh Token:", session.refreshToken.token);

    return user; // Optionally return the user object
  } catch (error) {
    console.error("User is not signed in:", error);
    return null; // Return null if not signed in
  }
};

export default checkUserSignIn;