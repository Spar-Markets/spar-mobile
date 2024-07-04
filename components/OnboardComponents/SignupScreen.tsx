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
} from 'react-native';
import {useTheme} from '../ContextComponents/ThemeContext';
import {useDimensions} from '../ContextComponents/DimensionsContext';
import createOnboardStyles from '../../styles/createOnboardStyles';
import {useNavigation} from '@react-navigation/native';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../../firebase/firebase';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import {serverUrl} from '../../constants/global';
import useUserDetails from '../../hooks/useUserDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupScreen = (props: any) => {
  const {user} = useAuth();

  // Layout and Style Initialization
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createOnboardStyles(theme, width);

  const navigation = useNavigation<any>();

  const [emailInput, setEmailInput] = useState('');
  const [username, setUsername] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirmInput, setPasswordConfirmInput] = useState('');

  const emailInputRef = useRef<TextInput>(null);

  /**
   * Creates user in firebase auth and in MongoDB
   * @todo need to do username check against database...
   * */
  const handleSubmit = async () => {
    console.log('STEP 1');
    if (
      emailInput !== '' &&
      passwordInput !== '' &&
      passwordConfirmInput !== '' &&
      username !== ''
    ) {
      console.log('STEP 2');
      if (passwordInput === passwordConfirmInput) {
        console.log('STEP 3');
        try {
          console.log('STEP 4');
          // Check for username uniqueness needs to be here before auth flow
          const credentials = await createUserWithEmailAndPassword(
            auth,
            emailInput,
            passwordInput,
          );
          console.log('Credentials:', credentials);
          if (credentials.user) {
            const response = await axios.post(serverUrl + '/createUser', {
              email: (credentials.user as any).email,
              userID: (credentials.user as any).uid,
              username: username,
            });

            // Sets userID globally in async
            if (response) {
              console.log('Credentials inside if statement:', credentials);
              console.log('Credentials UID:', (credentials.user as any).uid);
              await AsyncStorage.setItem(
                'userID',
                (credentials.user as any).uid,
              ).then(() => {});
            }
          }
          // console.log(response.data)

          // TODO make this production level: if there is an axios error, the user will still get into firebase and the rest of app but not be in MongoDB,
          // maybe create global hook that allows for MongoDB user population and make sure that it is populated
        } catch (error) {
          console.log(error);
          Alert.alert('Error creating account, please try again');
        }
      } else {
        Alert.alert('Passwords do not match');
      }
    } else {
      Alert.alert('Please make sure all fields are filled');
    }
  };

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -30 : -100}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardDismissMode="on-drag">
        <View style={styles.container}>
          <Text style={styles.mainText}>Create an account</Text>
          <View style={styles.inputContainer}>
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
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.textInputType}>Create Username</Text>
            <TextInput
              placeholderTextColor={theme.colors.tertiary}
              onChangeText={setUsername}
              value={username}
              style={styles.inputText}
              selectionColor={theme.colors.accent}
              maxLength={100}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.textInputType}>Password</Text>
            <TextInput
              placeholderTextColor={theme.colors.tertiary}
              onChangeText={setPasswordInput}
              value={passwordInput}
              style={styles.inputText}
              selectionColor={theme.colors.accent}
              maxLength={20}
              secureTextEntry={true}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.textInputType}>Confirm Password</Text>
            <TextInput
              placeholderTextColor={theme.colors.tertiary}
              onChangeText={setPasswordConfirmInput}
              value={passwordConfirmInput}
              style={styles.inputText}
              selectionColor={theme.colors.accent}
              maxLength={20}
              secureTextEntry={true}
            />
          </View>
          <View style={{flex: 1}}></View>
          <TouchableOpacity
            onPress={() => navigation.navigate('LoginScreen')}
            style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: theme.colors.text}}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpBtn} onPress={handleSubmit}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
