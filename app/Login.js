import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

GoogleSignin.configure({
  webClientId: '452177743942-2b8kcolj2g278hci3nfjlq5f90jpgaga.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export const SignInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const result = await GoogleSignin.signIn();

    // Check if the result is valid
    if (!result || !result.data || !result.data.user || !result.data.idToken) {
      throw new Error('Google Sign-In failed or incomplete data returned.');
    }

    const { idToken, user } = result.data;
    const email = user.email.toLowerCase(); // Normalize to lowercase

    console.log('User email:', email); // Debug: Print the email being used for sign-in

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Replace '.' with ',' to use the email as a Firebase key
    const emailKey = email.replace('.', ','); // Firebase Realtime Database key-safe

    // Check if the email already exists in the Realtime Database
    const emailRef = database().ref('/emails/' + emailKey);
    const snapshot = await emailRef.once('value');

    if (snapshot.exists()) {
      console.log(`Email ${email} already exists in the database.`);
      // If the email exists in the Realtime Database, proceed with sign-in
      await auth().signInWithCredential(googleCredential);
      await GoogleSignin.revokeAccess();
      return true; // Email exists, continue without adding
    } else {
      Alert.alert('Sorry, it looks like your email is not registered with us.');
      return false; // Email does not exist in Realtime Database
    }

  } catch (error) {
    Alert.alert('An error occurred during sign-in. Please try again.');
    console.error('Error during sign-in:', error.message, error.stack);
    return false;
  }
};
