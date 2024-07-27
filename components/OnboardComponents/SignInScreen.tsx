import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createOnboardStyles from '../../styles/createOnboardStyles';
import {useNavigation} from '@react-navigation/native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {auth, storage} from '../../firebase/firebase';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import {serverUrl} from '../../constants/global';
import useUserDetails from '../../hooks/useUserDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {getDownloadURL, ref} from 'firebase/storage';
import {useDispatch} from 'react-redux';
import {setUserIsMade} from '../../GlobalDataManagment/userSlice';

const SignInScreen = (props: any) => {
  const {user} = useAuth();

  // Layout and Style Initialization
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createOnboardStyles(theme, width);

  const navigation = useNavigation<any>();

  const [emailInput, setEmailInput] = useState('');
  const [isEmailFocused, setisEmailFocused] = useState(false); // State to track focus

  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordFocused, setisPasswordFocused] = useState(false);

  const emailInputRef = useRef<TextInput>(null);

  const passwordInputRef = useRef<TextInput>(null);

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (emailInput != '' && passwordInput != '') {
      try {
        //TODO
        //search for username and user in mongo and get corresponding email,
        //grab the email and set it it emailInput, then run sinInwithEmailandPassword

        const credentials = await signInWithEmailAndPassword(
          auth,
          emailInput,
          passwordInput,
        );
        if (credentials.user) {
          //sets userID globally in async
          console.log(credentials.user);
          await AsyncStorage.setItem(
            'userID',
            (credentials.user as any).uid,
          ).then(() => {
            dispatch(setUserIsMade(true));
          });

          const userInMongo = await axios.post(`${serverUrl}/getUser`, {
            userID: (credentials.user as any).uid,
          });

          console.log(
            'userinmongo',
            userInMongo,
            'hello',
            userInMongo.data.hasDefaultProfileImage,
            'mongoooo',
            userInMongo.data.defaultProfileImage,
          );
          await AsyncStorage.setItem(
            'hasDefaultProfileImage',
            userInMongo.data.hasDefaultProfileImage,
          );
          await AsyncStorage.setItem(
            'defaultProfileImage',
            userInMongo.data.defaultProfileImage,
          );
        }
      } catch (error) {
        console.log(error);
        Alert.alert('Error loggin in, email or password incorrect');
      }
    } else {
      Alert.alert('Please make sure all fields are filled');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -30 : -100}>
      <View style={{flexGrow: 1}}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Onboard1', {reverseAnimation: true})
            }>
            <Icon name={'times'} size={24} color={theme.colors.opposite} />
          </TouchableOpacity>
          <Text style={styles.mainText}>Sign In</Text>
          <View style={{flex: 1}}></View>
          <View
            style={[
              styles.inputContainer,
              isEmailFocused && {borderColor: theme.colors.accent},
            ]}>
            <Text style={styles.textInputType}>Email</Text>
            <TextInput
              ref={emailInputRef}
              placeholderTextColor={theme.colors.tertiary}
              onChangeText={setEmailInput}
              value={emailInput}
              style={styles.inputText}
              selectionColor={theme.colors.accent}
              maxLength={100}
              autoFocus={true} // Auto focus the email input field
              autoCapitalize="none"
              onFocus={() => setisEmailFocused(true)} // Set focus state
              onBlur={() => setisEmailFocused(false)} // Set focus state
            />
          </View>
          <View
            style={[
              styles.inputContainer,
              isPasswordFocused && {borderColor: theme.colors.accent},
            ]}>
            <Text style={styles.textInputType}>Password</Text>
            <TextInput
              ref={passwordInputRef}
              placeholderTextColor={theme.colors.tertiary}
              onChangeText={setPasswordInput}
              value={passwordInput}
              style={styles.inputText}
              selectionColor={theme.colors.accent}
              maxLength={100}
              autoCapitalize="none"
              onFocus={() => setisPasswordFocused(true)} // Set focus state
              onBlur={() => setisPasswordFocused(false)}
              secureTextEntry
            />
          </View>
          <View style={{flex: 1}}></View>
          {/*<TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text }}>Already have an account? Log in</Text>
            </TouchableOpacity>*/}
          <TouchableOpacity style={styles.signUpBtn} onPress={handleSubmit}>
            <Text style={styles.signUpText}>Launch Spar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
