import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firebase from '@react-native-firebase/app';  // ✅ Okay to import for checking

// ✅ Just check but do NOT call initializeApp manually
if (!firebase.apps.length) {
  console.error('❌ Firebase app is not initialized correctly.');
  Alert.alert('Network Error', 'Please restart the app and try again.');
}

GoogleSignin.configure({
  webClientId: '452177743942-2b8kcolj2g278hci3nfjlq5f90jpgaga.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export const SignInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const result = await GoogleSignin.signIn();

    const { idToken, user } = result.data;
  
    const email = user.email.toLowerCase(); // Normalize to lowercase

    console.log('User email:', email);

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Replace '.' with ',' to use the email as a Firebase key
    const emailKey = email.replace('.', ',');
    const emailRef = database().ref('/emails/' + emailKey);
    const snapshot = await emailRef.once('value');

    if (snapshot.exists()) {
      console.log(`Email ${email} already exists in the database.`);
      await auth().signInWithCredential(googleCredential);
      await GoogleSignin.revokeAccess();
      return true;
    } else {
      Alert.alert('Sorry, it looks like your email is not registered with us.');
      return false;
    }
  } catch (error) {
    Alert.alert('An error occurred during sign-in. Please try again.');
    console.error('Error during sign-in:', error.message, error.stack);
    return false;
  }
};
