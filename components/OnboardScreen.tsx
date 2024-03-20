import React, { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Auth0, { useAuth0, Auth0Provider } from 'react-native-auth0';
import axios from 'axios';
import { serverUrl } from '../constants/global';
import Auth0Context from 'react-native-auth0/lib/typescript/src/hooks/auth0-context';

const OnboardScreen = () => {
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { authorize, user } = useAuth0();

  // Function to check if the user is authenticated on app startup
  const checkAuthentication = async () => {
    try {
      const authData = await AsyncStorage.getItem('authData');
      if (authData) {
        setIsAuthenticated(true);
        navigation.replace('CoreApp');
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
      
      const test = await authorize();
      console.log(test)
      
      console.log("User data: " + user);
      
      const data = {
        email: user!.email,
      };
   
      //console.log(data)
      console.log("Print Before Endpoint")
      console.log(data)
      const response = await axios.post(serverUrl+'/checkUserExists', data)
      console.log(response.data)

      // parse the response here to find out if it exists or not

      // sign up creates user in auth0 but not in mongo


      if (response.data == true) {
        setIsAuthenticated(true);
        navigation.replace('CoreApp');
      } else {
        await axios.post(serverUrl+'/createUser', data);
        navigation.replace('CoreApp');
      }
      
      // Save authentication state to AsyncStorage
      await AsyncStorage.setItem('authData', 'authenticated');
    } catch (error) {
      console.error('Error logging in:', error);
    }
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
          <TouchableOpacity>
            <Text>Logged In</Text>
          </TouchableOpacity>
        )}
      </View>
    </Auth0Provider>
  );
};

export default OnboardScreen;
