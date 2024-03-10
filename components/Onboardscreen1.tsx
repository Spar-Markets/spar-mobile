import React, { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth0, Auth0Provider } from 'react-native-auth0';

const Onboardscreen1 = () => {
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { authorize, logout } = useAuth0();

  // Function to check if the user is authenticated on app startup
  const checkAuthentication = async () => {
    try {
      const authData = await AsyncStorage.getItem('authData');
      if (authData) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error retrieving authentication data:', error);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Function to handle user login
  const handleLogin = async () => {
    try {
      await authorize();
      setIsAuthenticated(true);
      // Save authentication state to AsyncStorage
      await AsyncStorage.setItem('authData', 'authenticated');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      // Clear authentication state from AsyncStorage
      await AsyncStorage.removeItem('authData');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Function to navigate to the next screen
  const goToNextScreen = () => {
    navigation.navigate('Login');
  };

  return (
    <Auth0Provider
      domain={"dev-wol45o5xjg0gma8k.us.auth0.com"}
      clientId={"o8K4SMbnC2Y059k4PZ1gkpCaj3Hb8dgP"}
    >
      <View>
        <Text>The only portfolio wagering app.</Text>
        {!isAuthenticated ? (
          <TouchableOpacity onPress={handleLogin}>
            <Text>Log In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleLogout}>
            <Text>Log Out</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={goToNextScreen}>
          <Text>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </Auth0Provider>
  );
};

export default Onboardscreen1;
