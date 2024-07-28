// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Animated,
//   StyleSheet,
//   Dimensions,
//   Button,
//   TextInput,
//   Alert,
// } from 'react-native';
// import {useTheme} from '../ContextComponents/ThemeContext';
// import {useDimensions} from '../ContextComponents/DimensionsContext';
// import createOnboardStyles from '../../styles/createOnboardStyles';
// import {useNavigation} from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import {signInWithEmailAndPassword} from 'firebase/auth';
// import {auth} from '../../firebase/firebase';
// import useUserDetails from '../../hooks/useUserDetails';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {useDispatch} from 'react-redux';
// import {setUserIsMade} from '../../GlobalDataManagment/userSlice';
// import {serverUrl} from '../../constants/global';
// import axios from 'axios';

// const LoginScreen = () => {
//   // Layour and Style Initilization
//   const {theme} = useTheme();
//   const {width, height} = useDimensions();
//   const styles = createOnboardStyles(theme, width);
//   const {userData} = useUserDetails();

//   const navigation = useNavigation<any>();

//   const [emailInput, setEmailInput] = useState('');
//   const [passwordInput, setPasswordInput] = useState('');

//   const dispatch = useDispatch();

//   const handleSubmit = async () => {
//     if (emailInput != '' && passwordInput != '') {
//       try {
//         //TODO
//         //search for username and user in mongo and get corresponding email,
//         //grab the email and set it it emailInput, then run sinInwithEmailandPassword

//         const credentials = await signInWithEmailAndPassword(
//           auth,
//           emailInput,
//           passwordInput,
//         );
//         console.log('mongooooo');
//         if (credentials.user) {
//           //sets userID globally in async
//           console.log(credentials.user);
//           await AsyncStorage.setItem('userID', (credentials.user as any).uid);

//           const userInMongo = await axios.post(`${serverUrl}/getUser`, {
//             userID: (credentials.user as any).uid,
//           });

//           console.log(
//             'userinmongo',
//             userInMongo,
//             userInMongo.data.hasDefaultProfileImage,
//             userInMongo.data.defaultProfileImage,
//           );
//           await AsyncStorage.setItem(
//             'hasDefaultProfileImage',
//             userInMongo.data.hasDefaultProfileImage,
//           );
//           await AsyncStorage.setItem(
//             'defaultProfileImage',
//             userInMongo.data.defaultProfileImage,
//           );

//           dispatch(setUserIsMade(true));
//         }
//       } catch (error) {
//         console.log(error);
//         Alert.alert('Error loggin in, email or password incorrect');
//       }
//     } else {
//       Alert.alert('Please make sure all fields are filled');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.mainText}>Log in</Text>
//       <View style={styles.inputContainer}>
//         <Text style={styles.textInputType}>Email</Text>
//         <TextInput
//           placeholderTextColor={theme.colors.tertiary}
//           onChangeText={setEmailInput}
//           value={emailInput}
//           style={styles.inputText}
//           selectionColor={theme.colors.accent}
//           maxLength={100}
//           multiline
//         />
//       </View>
//       <View style={styles.inputContainer}>
//         <Text style={styles.textInputType}>Password</Text>
//         <TextInput
//           placeholderTextColor={theme.colors.tertiary}
//           onChangeText={setPasswordInput}
//           value={passwordInput}
//           style={styles.inputText}
//           selectionColor={theme.colors.accent}
//           maxLength={20}
//           secureTextEntry={true}
//         />
//       </View>
//       <View style={{flex: 1}}></View>
//       <TouchableOpacity
//         onPress={() => navigation.goBack()}
//         style={{justifyContent: 'center', alignItems: 'center'}}>
//         <Text style={{color: theme.colors.text}}>
//           Don't have an account? Sign Up
//         </Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.signUpBtn} onPress={handleSubmit}>
//         <Text style={styles.signUpText}>Log in</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default LoginScreen;
