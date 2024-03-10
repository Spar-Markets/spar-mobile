import React, { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth0, Auth0Provider } from 'react-native-auth0';

const Onboardscreen1 = () => {
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { authorize } = useAuth0();

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

  // Function to navigate to the next screen
  const goToNextScreen = () => {
    navigation.replace('CoreApp');
  };

  if (isAuthenticated == true) {
    goToNextScreen()
  }

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
          <TouchableOpacity>
            <Text>Logged In</Text>
          </TouchableOpacity>
        )}
      </View>
    </Auth0Provider>
  );
};

export default Onboardscreen1;
