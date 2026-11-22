// utils/authErrors.js
// Firebase gives error codes like "auth/invalid-email".
// This function turns them into friendly messages for the user.

export function getAuthErrorMessage(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Wrong email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a minute and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Please check your network.";
    default:
      return "Something went wrong. Please try again.";
  }
}
