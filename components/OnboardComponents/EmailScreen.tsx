import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createOnboardStyles from '../../styles/createOnboardStyles';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import { serverUrl } from '../../constants/global';
import useUserDetails from '../../hooks/useUserDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const EmailScreen = (props: any) => {
  const { user } = useAuth();

  // Layout and Style Initialization
  const { theme } = useTheme();
  const { width, height } = useDimensions();
  const styles = createOnboardStyles(theme, width);

  const navigation = useNavigation<any>();

  const [emailInput, setEmailInput] = useState('');
  const [isFocused, setIsFocused] = useState(false); // State to track focus

  const emailInputRef = useRef<TextInput>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const continueToPassword = () => {
    if (validateEmail(emailInput)) {
      navigation.navigate("PasswordScreen", {email: emailInput});
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
  }
  
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    });

    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -30 : -100}
    >
      <View style={{flexGrow: 1}}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.navigate("Onboard1", { reverseAnimation: true })}>
            <Icon name={"times"} size={24} color={theme.colors.opposite} />
          </TouchableOpacity>
          <Text style={styles.mainText}>What's your Email?</Text>
          <View style={{ flex: 1 }}></View>
          <View style={[styles.inputContainer, isFocused && {borderColor: theme.colors.accent}]}>
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
              autoCapitalize='none'
              onFocus={() => setIsFocused(true)} // Set focus state
            />
          </View>
          <View style={{ flex: 1 }}></View>
          {/*<TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text }}>Already have an account? Log in</Text>
            </TouchableOpacity>*/}
          <TouchableOpacity style={styles.signUpBtn} onPress={continueToPassword}>
            <Text style={styles.signUpText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EmailScreen;
