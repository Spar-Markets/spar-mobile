import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createOnboardStyles from '../../styles/createOnboardStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../../firebase/firebase';
// import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
// import useUserDetails from '../../hooks/useUserDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const PasswordScreen = (props: any) => {

  // Layout and Style Initialization
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createOnboardStyles(theme, width);

  const navigation = useNavigation<any>();

  const [passwordInput, setpasswordInput] = useState('');
  const [isFocused, setIsFocused] = useState(false); // State to track focus
  const [verificationSent, setVerificationSent] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  const route = useRoute<any>();
  const email = route.params?.email;


  useEffect(() => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }

    console.log("Email:", email)
  }, []);

  const continueToUsername = () => {
    if (passwordInput.length >= 6) {
      navigation.navigate("UsernameScreen", {email: email, password: passwordInput});
    } else {
      Alert.alert('Invalid Password', 'Make it Longer');
    }
  }


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -30 : -100}
    >
      <View style={{flexGrow: 1}}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name={"times"} size={24} color={theme.colors.opposite} />
          </TouchableOpacity>
          <Text style={styles.mainText}>Choose a Password</Text>
          <View style={{ flex: 1 }}></View>
          <View style={[styles.inputContainer, isFocused && {borderColor: theme.colors.accent}]}>
            <Text style={styles.textInputType}>Password</Text>
            <TextInput
              ref={passwordInputRef}
              placeholderTextColor={theme.colors.tertiary}
              onChangeText={setpasswordInput}
              value={passwordInput}
              style={styles.inputText}
              selectionColor={theme.colors.accent}
              maxLength={100}
              autoFocus={true} // Auto focus the email input field
              autoCapitalize='none'
              onFocus={() => setIsFocused(true)} // Set focus state
              secureTextEntry
            />
          </View>
          <View style={{ flex: 1 }}></View>
          {/*<TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text }}>Already have an account? Log in</Text>
            </TouchableOpacity>*/}
          <TouchableOpacity style={styles.signUpBtn} onPress={continueToUsername}>
            <Text style={styles.signUpText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PasswordScreen;
