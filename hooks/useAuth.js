// import {View, Text} from 'react-native';
// import React, {useEffect, useState} from 'react';
// // import {onAuthStateChanged} from 'firebase/auth';
// // import {auth} from '../firebase/firebase';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import User from '../types/User';
// import {useDispatch} from 'react-redux';
// import {setUserID, setUserIsMade} from '../GlobalDataManagment/userSlice';

// /**
//  * Used to log in to firebase and persistence
//  * @returns
//  */
// const useAuth = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const dispatch = useDispatch();

//   useEffect(() => {
//     const loadUser = async () => {
//       const storedUser = await AsyncStorage.getItem('user');
//       if (storedUser) {
//         setUser(JSON.parse(storedUser));
//         dispatch(setUserIsMade(true));
//         dispatch(setUserID(JSON.parse(storedUser).uid));
//       }
//       setLoading(false);
//     };

//     loadUser();

//     const unsub = onAuthStateChanged(auth, async user => {
//       //console.log('got user:', user);
//       if (user) {
//         await AsyncStorage.setItem('user', JSON.stringify(user));
//         setUser(user);
//       } else {
//         await AsyncStorage.removeItem('user');
//         setUser(null);
//       }
//       setLoading(false);
//     });
//     return unsub;
//   }, []);

//   return {user, loading};
// };

// export default useAuth;
