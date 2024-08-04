// // Import the functions you need from the SDKs you need
// import {initializeApp} from 'firebase/app';
// import {
//   getAnalytics,
//   isSupported as isAnalyticsSupported,
// } from 'firebase/analytics';
// import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {getStorage, ref, getDownloadURL} from 'firebase/storage';

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: 'AIzaSyCsABH80lkP7M0aAPIEJAsjZoE5ygOOUX4',
//   authDomain: 'sparmarkets.firebaseapp.com',
//   projectId: 'sparmarkets',
//   storageBucket: 'sparmarkets.appspot.com',
//   messagingSenderId: '110587119012',
//   appId: '1:110587119012:web:42e5bfdfc75551fdea6d31',
//   measurementId: 'G-PDJTW9VBX5',
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);

// // Initialize Firebase Analytics if supported
// isAnalyticsSupported()
//   .then(supported => {
//     if (supported) {
//       const analytics = getAnalytics(app);
//     } else {
//       console.log('Firebase Analytics is not supported in this environment.');
//     }
//   })
//   .catch(error => {
//     console.error('Error checking Firebase Analytics support:', error);
//   });

// // Initialize Firebase Authentication with AsyncStorage for persistence
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// export {auth, storage};
