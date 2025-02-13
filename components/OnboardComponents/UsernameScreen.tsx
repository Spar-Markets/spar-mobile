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
import {useNavigation, useRoute} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import {serverUrl} from '../../constants/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useDispatch} from 'react-redux';
import {
  setUserID,
} from '../../GlobalDataManagment/userSlice';

const UsernameScreen = (props: any) => {
  // Layout and Style Initialization
  const {theme} = useTheme();
  const {width, height} = useDimensions();
  const styles = createOnboardStyles(theme, width);

  const navigation = useNavigation<any>();

  const [usernameInput, setusernameInput] = useState('');
  const [isFocused, setIsFocused] = useState(false); // State to track focus
  const [verificationSent, setVerificationSent] = useState(false);

  const usernameInputRef = useRef<TextInput>(null);

  const route = useRoute<any>();
  const email = route.params?.email;
  const password = route.params?.password;

  const dispatch = useDispatch();

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }

    console.log('Email:', email);
    console.log('Password:', password);
  }, []);

  const isUsernameTaken = async (username: string) => {
    const encodedUsername = encodeURIComponent(username);
    const response = await axios.get(serverUrl + `/checkUsername/${encodedUsername}`);
    return response.data.taken;
  }

  const handleSubmit = async () => {
    try {
      // Check for username uniqueness
      if (await isUsernameTaken(usernameInput)) {
        Alert.alert('Username is Taken', 'Please enter another username');
        return;
      }

      const credentials = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      if (credentials.user) {
        // Array of profile images
        const profileImages = [1, 2, 3];

        // Select a random profile image
        const randomImage =
          profileImages[Math.floor(Math.random() * profileImages.length)];

        console.log('User profile image initialized in AsyncStorage');

        const response = await axios.post(serverUrl + '/createUser', {
          email: (credentials.user as any).email,
          userID: (credentials.user as any).uid,
          username: usernameInput,
          defaultProfileImage: randomImage,
          hasDefaultProfileImage: 'true',
        });

        // handle conflict error
        if (response.status == 409) {
          Alert.alert(response.data.error);
          return;
        }

        // 
        if (response) {
          console.log('About to set userID');
          console.log('Credentials:', credentials);
          console.log('Credentials UID', (credentials.user as any).uid);
          dispatch(setUserID((credentials.user as any).uid));
        }
      }

      // set
      // console.log(response.data)

      // it should navigate right here
      console.log('should navigate here in usernamescreen');

      // TODO make this production level: if there is an axios error, the user will still get into firebase and the rest of app but not be in MongoDB,
      // maybe create global hook that allows for MongoDB user population and make sure that it is populated
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.error('That email address is already in use!');
        Alert.alert('That email address is already in use!');
      }
      else if (error.code === 'auth/invalid-email') {
        console.error('That email address is invalid!');
      } else {
        console.error(error);
        Alert.alert('Error creating account');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -30 : -100}>
      <View style={{flexGrow: 1}}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name={'times'} size={24} color={theme.colors.opposite} />
          </TouchableOpacity>
          <Text style={styles.mainText}>What do you go by?</Text>
          <View style={{flex: 1}}></View>
          <View
            style={[
              styles.inputContainer,
              isFocused && {borderColor: theme.colors.accent},
            ]}>
            <Text style={styles.textInputType}>Username</Text>
            <TextInput
              ref={usernameInputRef}
              placeholderTextColor={theme.colors.tertiary}
              onChangeText={setusernameInput}
              value={usernameInput}
              style={styles.inputText}
              selectionColor={theme.colors.accent}
              maxLength={20}
              autoFocus={true} // Auto focus the email input field
              autoCapitalize="none"
              onFocus={() => setIsFocused(true)} // Set focus state
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

export default UsernameScreen;
