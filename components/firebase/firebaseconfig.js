import firebase from 'firebase/app';
import 'firebase/storage'; // Import additional services like firebase/firestore, firebase/auth as needed

const firebaseConfig = {
  apiKey: 'Your_API_Key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

// Initialize Firebase only if it hasn't been initialized yet
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
