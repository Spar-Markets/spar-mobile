import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Auth0, { useAuth0, Auth0Provider } from 'react-native-auth0';
import axios from 'axios';
import { serverUrl } from '../constants/global';

const OnboardScreen = () => {
  const navigation = useNavigation<any>(); // Define navigation prop with 'any' type
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { authorize, user } = useAuth0();
  const colorScheme = useColorScheme();
  const [currStyles, setCurrStyles] = useState(darkStyles);


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
    setCurrStyles(colorScheme == "dark" ? darkStyles : lightStyles);
  }, [colorScheme]);

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
      <View style={currStyles.container}>
        <Text style={currStyles.mainTxt}>Competitive Stock Trading</Text>
        <TouchableOpacity onPress={handleLogin} style={currStyles.button}>
          <Text style={currStyles.buttonTxt}>Get Started</Text>
        </TouchableOpacity>

        {/*{!isAuthenticated ? (
          <TouchableOpacity onPress={handleLogin}>
            <Text>Log In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Text>Logged In</Text>
          </TouchableOpacity>
        )}*/}
      </View>
    </Auth0Provider>
  );
};

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    justifyContent: 'center',
    gap: 30
  },
  mainTxt: {
    color: 'white',
    fontSize: 50,
    marginHorizontal: 24,
    fontFamily: 'InterTight-Black'
  },
  button: {
    backgroundColor: '#3B30B9',
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15
  },
  buttonTxt: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E6E6",
    justifyContent: 'center',
    gap: 30
  },
  mainTxt: {
    color: '#181818',
    fontSize: 50,
    marginHorizontal: 24,
    fontFamily: 'InterTight-Black'
  },
  button: {
    backgroundColor: '#3B30B9',
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15
  },
  buttonTxt: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'InterTight-Black'
  }
})

export default OnboardScreen;
